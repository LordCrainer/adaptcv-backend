import type { IUsers, RequestUserData } from '@lordcrainer/adaptcv-shared-types'

import { AuthService } from '@src/api/Auth/auth.service'
import { AUTH_MESSAGES } from '@src/api/Auth/constants/auth.messages'
import { Roles } from '@src/api/Roles/roles'
import { USER_MESSAGES } from '@src/api/Users/constants/users.message'
import { UserService } from '@src/api/Users/users.service'
import { redisClient } from '@src/config/cache/redis'
import { customError } from '@src/Shared/utils/errorUtils'

const AuthMiddleware =
  (userService: UserService, authService: AuthService): IController =>
  async (req, res, next) => {
    const tokenReq = (req.headers.authorization ||
      req.headers.Authorization ||
      '') as string

    try {
      const token = tokenReq?.split(' ')[1]
      if (!token) {
        throw customError('unauthorized', AUTH_MESSAGES.unauthorized)
      }

      const tokenData = await authService.verifyToken(token)
      if (!tokenData?._id && !tokenData?.exp) {
        throw customError('accessDenied', AUTH_MESSAGES.invalid_token)
      }

      const userCache = await redisClient.get(`requestUser-${tokenData.userId}`)
      let user: IUsers

      if (userCache) {
        user = JSON.parse(userCache)
      } else {
        const response = await userService.getUser({
          userId: tokenData.userId
        })
        user = response.data

        if (!user) {
          throw customError('accessDenied', USER_MESSAGES.not_found)
        }

        authService.refreshCacheExpiration(tokenData.userId)
      }

      req.requestUser = mapperUserRequest(user)

      req.token = token

      next()
    } catch (error) {
      next(error)
    }
  }

function mapperUserRequest(user: IUsers): RequestUserData {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    status: user.status,
    isSuperAdmin: user.isSuperAdmin,
    currentRole: user.isSuperAdmin
      ? Roles.byName('superAdmin')
      : Roles.byName('user')
  }
}

export { AuthMiddleware }
