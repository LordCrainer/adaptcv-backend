import jwt from 'jsonwebtoken'

import type { UserRepository } from '@Api/Users/interfaces/users.repository'
import type { IUsers, LoginRequest } from '@lordcrainer/adaptcv-shared-types'
import type {
  RequestUserData,
  TokenLoginResponse
} from '@src/api/Auth/dto/auth.interface'

import { customError } from '@Shared/utils/errorUtils'
import { redisClient } from '@src/config/cache/redis'
import config from '@src/config/environments'
import Logger from '@src/lib/logger'
import { getTokenExpirationInSeconds } from '@src/Shared/utils/auth.utils'

import { USER_MESSAGES } from '../Users/constants/users.message'
import { checkPasswordHash } from '../Users/helpers/users.helpers'
import { AUTH_MESSAGES } from './constants/auth.messages'
import { AuthResponseDto } from './dto/auth.dto'

/**
 * @export
 * @implements {IAuthService}
 */
export class AuthService {
  private readonly userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async login(params: LoginRequest) {
    if (!params.email || !params.password) {
      throw customError('validationParams', AUTH_MESSAGES.params_missing)
    }

    const foundUser = await this.userRepository.findOne({
      email: params.email
    })

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

    const payload = {
      _id: foundUser._id,
      email: foundUser.email
    }

    const tokenData = this.generateToken(payload, { expiresIn: '1h' })
    const refreshToken = this.generateToken(payload, { expiresIn: '7d' })

    const user = <RequestUserData>{
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      timezone: foundUser?.timezone,
      isSuperAdmin: foundUser?.isSuperAdmin
    }

    const expireSec = getTokenExpirationInSeconds(tokenData.expiresAt)

    redisClient.set(`requestUser-${user._id}`, JSON.stringify(user), {
      EX: expireSec
    })
    redisClient.set(`token-user-${user._id}`, tokenData.token, {
      EX: expireSec
    })

    return new AuthResponseDto({
      user,
      token: tokenData.token,
      refreshToken
    })
  }

  async logOut(p: { userId: string }) {
    if (!p.userId) {
      throw customError('validationParams', AUTH_MESSAGES.params_missing)
    }

    redisClient.del(`token-user-${p.userId}`)
    redisClient.del(`requestUser-${p.userId}`)
    Logger.info(`Token deleted from Redis for user ${p.userId}`)
    return true
  }

  async signUp(User: IUsers) {
    const user = await this.userRepository.create(User)
    if (!user) {
      throw customError('notFound', USER_MESSAGES.not_created)
    }

    return { user }
  }

  async isAuthenticated(User: IUsers): Promise<IApiResponse<IUsers>> {
    // const user = await this.userRepository.getByProps(User, 'email');
    return {
      data: {} as IUsers,
      message: AUTH_MESSAGES.is_authenticated
    }
  }

  async refreshToken(
    currentRefreshToken: string
  ): Promise<{ token: string; expiresAt: number }> {
    if (!currentRefreshToken) {
      throw customError('validationParams', AUTH_MESSAGES.params_missing)
    }

    const user = this.verifyToken(currentRefreshToken) as {
      _id: string
      email: string
    }

    if (!user?._id || !user?.email) {
      throw customError('invalidToken', AUTH_MESSAGES.invalid_token)
    }

    const tokenData = this.generateToken(user, {
      expiresIn: '1h'
    })

    const expireSec = getTokenExpirationInSeconds(tokenData.expiresAt)

    await redisClient.set(`token-user-${user._id}`, tokenData.token, {
      EX: expireSec
    })

    return { token: tokenData.token, expiresAt: tokenData.expiresAt }
  }

  generateToken(
    payload: any,
    options?: jwt.SignOptions & { expireSeconds?: number }
  ): TokenLoginResponse {
    try {
      const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: options?.expiresIn || options?.expireSeconds || 24 * 60 * 60
      })

      const decodedToken = jwt.decode(token) as jwt.JwtPayload

      return {
        token,
        expiresAt: (decodedToken.exp as number) * 1000,
        createdAt: (decodedToken.iat as number) * 1000
      }
    } catch (error) {
      throw customError('internalServerError', 'Error generating token')
    }
  }

  decodeToken(token: string): jwt.JwtPayload {
    try {
      const decoded = jwt.decode(token, { complete: true })
      if (!decoded || typeof decoded === 'string') {
        throw customError('invalidToken', AUTH_MESSAGES.invalid_token)
      }
      return decoded.payload as jwt.JwtPayload
    } catch (error) {
      throw customError('invalidToken', AUTH_MESSAGES.invalid_token)
    }
  }

  verifyToken(token: string): jwt.JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret)
      return decoded as jwt.JwtPayload
    } catch (error) {
      throw customError('invalidToken', AUTH_MESSAGES.invalid_token)
    }
  }
}
