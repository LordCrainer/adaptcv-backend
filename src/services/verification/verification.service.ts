import jwt from 'jsonwebtoken'

import crypto from 'crypto'
import type { IUsers } from '@lordcrainer/adaptcv-shared-types'

import { redisClient } from '@src/config/cache/redis'
import config from '@src/config/environments'
import Logger from '@src/lib/logger'
import { customError } from '@src/Shared/utils/errorUtils'

export interface VerificationTokenData {
  userId: string
  email: string
  type: 'email_verification'
  iat: number
  exp: number
}

export interface VerificationResult {
  success: boolean
  userId?: string
  email?: string
  message: string
}

export class VerificationService {
  private readonly tokenExpiration = 24 * 60 * 60
  private readonly redisPrefix = 'email_verification:'

  /**
   * Generate a unique verification token for the user
   * @param user - The user object containing user details
   * @returns A JWT token that can be used for email verification
   */
  generateVerificationToken(user: IUsers): string {
    const payload: Omit<VerificationTokenData, 'iat' | 'exp'> = {
      userId: user._id,
      email: user.email,
      type: 'email_verification'
    }

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: this.tokenExpiration
    })

    // Save the token in Redis for later verification
    this.storeTokenInRedis(user._id, token)

    return token
  }

  /**
   * Verifies the provided token
   * @param token - The JWT token to verify
   */
  async verifyToken(token: string): Promise<VerificationResult> {
    try {
      const decoded = jwt.verify(
        token,
        config.jwtSecret
      ) as VerificationTokenData

      if (decoded.type !== 'email_verification') {
        return {
          success: false,
          message: 'Invalid token type for email verification'
        }
      }

      // Check if the token exists in Redis (has not been invalidated)
      const storedToken = await redisClient.get(
        `${this.redisPrefix}${decoded.userId}`
      )

      if (!storedToken || storedToken !== token) {
        return {
          success: false,
          message: 'Token has expired or has already been used'
        }
      }

      // Token válido - lo eliminamos de Redis para que sea de un solo uso
      await this.invalidateToken(decoded.userId)

      Logger.info(`Email verification successful for user: ${decoded.userId}`)

      return {
        success: true,
        userId: decoded.userId,
        email: decoded.email,
        message: 'Email verified successfully'
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          success: false,
          message: 'The verification link has expired'
        }
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          message: 'Invalid verification link'
        }
      }

      Logger.error('Error verifying token', error)
      return {
        success: false,
        message: 'An error occurred while verifying the token'
      }
    }
  }

  /**
   * Stores the token in Redis
   */
  private async storeTokenInRedis(
    userId: string,
    token: string
  ): Promise<void> {
    try {
      await redisClient.set(`${this.redisPrefix}${userId}`, token, {
        expiration: {
          type: 'EX',
          value: this.tokenExpiration
        }
      })
    } catch (error) {
      Logger.error('Failed to store verification token in Redis', error)
    }
  }

  /**
   * Invalidates a verification token
   * @param userId - The ID of the user whose token should be invalidated
   */
  async invalidateToken(userId: string): Promise<void> {
    try {
      await redisClient.del(`${this.redisPrefix}${userId}`)
      Logger.info(`Verification token invalidated for user: ${userId}`)
    } catch (error) {
      Logger.error('Failed to invalidate verification token', error)
    }
  }

  /**
   * Checks if a user has a pending verification token
   * @param userId - The ID of the user to check
   * @returns True if a pending token exists, false otherwise
   */
  async hasPendingToken(userId: string): Promise<boolean> {
    try {
      const token = await redisClient.get(`${this.redisPrefix}${userId}`)
      return !!token
    } catch (error) {
      Logger.error('Failed to check pending token', error)
      return false
    }
  }

  /**
   * Generates a verification URL for the user
   * @param token - The verification token to include in the URL
   * @returns A URL that the user can visit to verify their email
   */
  generateVerificationUrl(token: string): string {
    const baseUrl = config.email?.verificationBaseUrl || config.server.url
    return `${baseUrl}/verify-email?token=${token}`
  }
}
