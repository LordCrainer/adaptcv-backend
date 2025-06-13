import { IUsers } from '@lordcrainer/adaptcv-shared-types'
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest'

import { AuthService } from '@src/api/Auth/auth.service'
import { AUTH_MESSAGES } from '@src/api/Auth/constants/auth.messages'
import { UserRepository } from '@src/api/Users/interfaces/users.repository'

// Mock Logger
vi.mock('@src/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  }
}))

// Mock Redis
vi.mock('@src/config/cache/redis', () => ({
  redisClient: {
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn()
  }
}))

// Mock config
vi.mock('@src/config/environments', () => ({
  default: {
    jwtSecret: 'test-secret'
  }
}))

// Mock bcrypt helpers
vi.mock('@src/api/Users/helpers/users.helpers', () => ({
  checkPasswordHash: vi.fn()
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockUserRepository: Mocked<UserRepository>

  beforeEach(() => {
    mockUserRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any

    authService = new AuthService(mockUserRepository)
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should create a new user and return IApiResponse', async () => {
      const newUser: IUsers = {
        _id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        status: 'pending'
      }

      const createdUser: IUsers = {
        ...newUser,
        _id: 'created-user-id'
      }

      mockUserRepository.create.mockResolvedValue(createdUser)

      const result = await authService.signUp(newUser)

      expect(result).toEqual({
        data: createdUser,
        message: AUTH_MESSAGES.sing_up
      })
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUser)
    })

    it('should throw error when user creation fails', async () => {
      const newUser: IUsers = {
        _id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        status: 'pending'
      }

      mockUserRepository.create.mockResolvedValue(null as any)

      await expect(authService.signUp(newUser)).rejects.toThrow()
    })
  })

  describe('logOut', () => {
    it('should logout user and return IApiResponse', async () => {
      const userId = 'user123'

      const result = await authService.logOut({ userId })

      expect(result).toEqual({
        data: true,
        message: AUTH_MESSAGES.logout
      })
    })

    it('should throw error when userId is missing', async () => {
      await expect(authService.logOut({ userId: '' })).rejects.toThrow()
    })
  })

  describe('isAuthenticated', () => {
    it('should return IApiResponse with authenticated status', async () => {
      const user: IUsers = {
        _id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        status: 'active'
      }

      const result = await authService.isAuthenticated(user)

      expect(result).toEqual({
        data: {} as IUsers,
        message: AUTH_MESSAGES.is_authenticated
      })
    })
  })

  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 0
      }

      const result = authService.generateToken(payload, { expiresIn: '1h' })

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('expiresAt')
      expect(result).toHaveProperty('createdAt')
      expect(typeof result.token).toBe('string')
      expect(typeof result.expiresAt).toBe('number')
      expect(typeof result.createdAt).toBe('number')
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 0
      }

      const tokenData = authService.generateToken(payload, { expiresIn: '1h' })
      const result = authService.verifyToken(tokenData.token)

      expect(result).toHaveProperty('userId', payload.userId)
      expect(result).toHaveProperty('email', payload.email)
    })

    it('should throw error for invalid token', () => {
      expect(() => authService.verifyToken('invalid-token')).toThrow()
    })
  })

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 0
      }

      const tokenData = authService.generateToken(payload, { expiresIn: '1h' })
      const result = authService.decodeToken(tokenData.token)

      expect(result).toHaveProperty('userId', payload.userId)
      expect(result).toHaveProperty('email', payload.email)
    })

    it('should throw error for invalid token format', () => {
      expect(() => authService.decodeToken('invalid-token')).toThrow()
    })
  })
})
