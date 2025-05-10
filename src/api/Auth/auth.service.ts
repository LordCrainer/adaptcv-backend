import jwt from 'jsonwebtoken'

import { customError } from '@Shared/utils/errorUtils'
import { redisClient } from '@src/config/cache/redis'
import config from '@src/config/environments'
import Logger from '@src/lib/logger'
import { getTokenExpirationInSeconds } from '@src/Shared/utils/auth.utils'

import { RequestUserData } from '@Api/Auth/interfaces/auth.interface'
import { IUsers } from '@Api/Users/interfaces/users.interface'
import { UserRepository } from '@Api/Users/interfaces/users.repository'

import { USER_MESSAGES } from '../Users/constants/users.message'
import { checkPasswordHash } from '../Users/helpers/users.helpers'
import { AUTH_MESSAGES } from './constants/auth.messages'

/**
 * @export
 * @implements {IAuthService}
 */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository
    // private readonly redis: typeof redisClient
  ) {}

  async login(
    params: IUsers
  ): Promise<IApiResponse<Partial<{ user: IUsers; token: any }>>> {
    if (!params.email || !params.password) {
      throw customError('validationParams', AUTH_MESSAGES.params_missing)
    }

    const foundUser = await this.userRepository.findOne(
      {
        email: params.email
      },
      { select: { password: 0 } }
    )

    if (!foundUser || !foundUser?.passwordHash) {
      throw customError('invalidCredentials', AUTH_MESSAGES.invalid_credentials)
    }
    const match = await checkPasswordHash(
      params.password,
      foundUser.passwordHash
    )

    if (!match) {
      throw new Error(AUTH_MESSAGES.invalid_credentials)
    }

    const tokenData = this.generateToken(foundUser)

    const user = <RequestUserData>{
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      timezone: foundUser?.timezone,
      isSuperAdmin: foundUser?.isSuperAdmin,
      organizations: foundUser.organizations
    }

    const expireSec = getTokenExpirationInSeconds(tokenData.expiresAt)

    await redisClient.set(`requestUser-${user._id}`, JSON.stringify(user), {
      EX: expireSec
    })

    return {
      data: { user, token: tokenData?.token },
      message: AUTH_MESSAGES.login
    }
  }

  async logOut(p: { userId: string }): Promise<IApiResponse<{}>> {
    await Promise.all([
      redisClient.del(`token-user-${p.userId}`),
      redisClient.del(`requestUser-${p.userId}`),
      redisClient.del(`organization-${p.userId}`)
    ])
    Logger.info(`Token deleted from Redis for user ${p.userId}`)
    return {
      data: {},
      message: AUTH_MESSAGES.logout
    }
  }

  async signUp(User: IUsers): Promise<IApiResponse<IUsers>> {
    const user = await this.userRepository.create(User)
    if (!user) {
      throw customError('notFound', USER_MESSAGES.not_created)
    }

    return {
      data: user,
      message: AUTH_MESSAGES.sing_up
    }
  }

  async isAuthenticated(User: IUsers): Promise<IApiResponse<IUsers>> {
    // const user = await this.userRepository.getByProps(User, 'email');
    return {
      data: {} as IUsers,
      message: AUTH_MESSAGES.is_authenticated
    }
  }

  generateToken(
    user: IUsers,
    options?: jwt.SignOptions & { expireSeconds?: number }
  ): { token: string; expiresAt: number; createdAt: number } {
    try {
      const now = new Date().getTime()
      const expiresAt =
        Math.floor(now) + (options?.expireSeconds || 24 * 60 * 60) * 1000

      const payload = { _id: user._id, email: user.email }
      const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: options?.expireSeconds || options?.expiresIn || '1d'
      })
      return {
        token,
        expiresAt,
        createdAt: now
      }
    } catch (error) {
      throw customError('internalServerError', 'Error generating token')
    }
  }
}
