import jwt from 'jsonwebtoken'

import type { UserRepository } from '@Api/Users/interfaces/users.repository'
import type { IUsers, LoginRequest } from '@lordcrainer/adaptcv-shared-types'
import type {
  ProfileCache,
  RequestUserData,
  TokenLoginResponse,
  TokenResponse
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

    const user = this.buildUser(foundUser)
    const userCache = this.buildUserCache(foundUser)
    const { accessToken, refreshToken } = this.buildTokenPayload(userCache)

    return new AuthResponseDto({
      user,
      accessToken,
      refreshToken
    })
  }

  private buildUser(foundUser: any): RequestUserData {
    return {
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      timezone: foundUser?.timezone,
      status: foundUser.status
    }
  }

  private buildUserCache(foundUser: any): ProfileCache {
    return {
      userId: foundUser._id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role || 0
    }
  }

  async logOut(p: { userId: string }) {
    if (!p.userId) {
      throw customError('validationParams', AUTH_MESSAGES.params_missing)
    }

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

  async refreshToken(currentRefreshToken: string): Promise<TokenResponse> {
    if (!currentRefreshToken) {
      throw customError('validationParams', AUTH_MESSAGES.params_missing)
    }

    const user = this.verifyToken(currentRefreshToken) as IUsers

    if (!user?._id || !user?.email) {
      throw customError('invalidToken', AUTH_MESSAGES.invalid_token)
    }

    const cacheUser = await this.getUserFromCache(user)
    return this.buildTokenPayload(cacheUser)
  }

  private async getUserFromCache(user: IUsers): Promise<ProfileCache> {
    const cachedUser = await redisClient.get(`requestUser-${user._id}`)
    if (!cachedUser) {
      throw customError('notFound', 'User not found in cache')
    }

    const parsedCacheUser: ProfileCache = JSON.parse(cachedUser)
    this.refreshCacheExpiration(parsedCacheUser)
    return parsedCacheUser
  }

  private refreshCacheExpiration(user: ProfileCache) {
    redisClient.set(`requestUser-${user.userId}`, JSON.stringify(user), {
      EX: 60 * 60 * 24 * 60
    })
  }

  private buildTokenPayload(payload: ProfileCache): TokenResponse {
    return {
      accessToken: this.generateToken(payload, { expiresIn: '1h' }).token,
      refreshToken: this.generateToken(payload, { expiresIn: '7d' }).token
    }
  }

  private generateToken(
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
      console.log('Error generating token:', error)
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
