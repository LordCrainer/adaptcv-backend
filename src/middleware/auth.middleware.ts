import type { RequestUserData } from '@lordcrainer/adaptcv-shared-types'
import type { userService as UserService } from '@src/api/Users/users.dependencies'

import { AUTH_MESSAGES } from '@src/api/Auth/constants/auth.messages'
import { Roles } from '@src/api/Roles/roles'
import { USER_MESSAGES } from '@src/api/Users/constants/users.message'
import { redisClient } from '@src/config/cache/redis'
import { getTokenExpirationInSeconds } from '@src/Shared/utils/auth.utils'
import { customError } from '@src/Shared/utils/errorUtils'

const AuthMiddleware =
  (userService: typeof UserService): IController =>
  async (req, res, next) => {
    const tokenReq = (req.headers.authorization ||
      req.headers.Authorization ||
      '') as string

    try {
      const token = tokenReq?.split(' ')[1]
      if (!token) {
        throw customError('unauthorized', AUTH_MESSAGES.unauthorized)
      }

      const tokenData = await userService.verifyToken(token)
      if (!tokenData?._id) {
        throw customError('accessDenied', AUTH_MESSAGES.invalid_token)
      }

      const userCache = await redisClient.get(`requestUser-${tokenData._id}`)
      let user: RequestUserData

      if (userCache) {
        user = JSON.parse(userCache)
      } else {
        const { data } = await userService.getUser({
          userId: tokenData._id
        })

        if (!data) {
          throw customError('accessDenied', USER_MESSAGES.not_found)
        }

        user = data

        const expireSec = getTokenExpirationInSeconds(tokenData.expiresAt)
        await redisClient.set(`requestUser-${user._id}`, JSON.stringify(user), {
          EX: expireSec
        })
      }

      req.requestUser = user
      req.requestUser.currentRole = user.isSuperAdmin
        ? Roles.byName('superAdmin')
        : req.requestUser?.currentRole || undefined

      req.token = token

      next()
    } catch (error) {
      next(error)
    }
  }

export { AuthMiddleware }
