import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { UserRepository } from '@src/api/Users/interfaces/users.repository'
import type { VerificationService } from '@src/services/verification/verification.service'

import { MockEmailService } from '@src/services/email/mock-email.service'
import { RegistrationService } from '@src/services/registration/registration.service'

// Mock dependencies
const mockUserRepository: UserRepository = {
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  find: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  updateMany: vi.fn(),
  findAndUpdate: vi.fn(),
  aggregate: vi.fn(),
  counterDocuments: vi.fn()
}

const mockEmailService = new MockEmailService()

const mockVerificationService: VerificationService = {
  generateVerificationToken: vi.fn(),
  verifyToken: vi.fn(),
  generateVerificationUrl: vi.fn(),
  invalidateToken: vi.fn(),
  hasPendingToken: vi.fn()
} as any

// Mock external modules
vi.mock('@src/lib/shortId', () => ({
  shortId: {
    rnd: () => 'test-user-id-123'
  }
}))

vi.mock('@src/services/verification/verification.service', () => ({
  VerificationService: vi.fn().mockImplementation(() => ({
    generateVerificationToken: vi.fn().mockReturnValue('mock-token-123'),
    generateVerificationUrl: vi
      .fn()
      .mockReturnValue('http://localhost:3000/verify?token=mock-token-123'),
    verifyToken: vi.fn(),
    hasPendingToken: vi.fn(),
    invalidateToken: vi.fn()
  }))
}))

describe('RegistrationService', () => {
  let registrationService: RegistrationService

  beforeEach(() => {
    vi.clearAllMocks()
    mockEmailService.clearSentEmails()

    // Setup verification service mocks
    vi.mocked(
      mockVerificationService.generateVerificationToken
    ).mockReturnValue('mock-token')
    vi.mocked(mockVerificationService.generateVerificationUrl).mockReturnValue(
      'https://example.com/verify?token=mock-token'
    )
    vi.mocked(mockVerificationService.verifyToken).mockResolvedValue({
      success: true,
      userId: 'test-user-id-123',
      email: 'john@example.com',
      message: 'Email verified successfully'
    })
    vi.mocked(mockVerificationService.hasPendingToken).mockResolvedValue(false)

    // Create service with mock providers
    registrationService = new RegistrationService(
      mockUserRepository,
      mockVerificationService,
      mockEmailService
    )
  })

  describe('registerUser', () => {
    const validRegisterData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    }

    beforeEach(() => {
      vi.clearAllMocks()
      mockEmailService.clearSentEmails()
    })

    it('should register a new user successfully', async () => {
      // Setup mocks
      // vi.mocked(mockUserRepository.findOne).mockResolvedValue({} as IUsers)
      vi.mocked(mockUserRepository.create).mockResolvedValue({
        _id: 'test-user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        status: 'pending',
        authProvider: 'local'
      } as IUsers)

      // Execute
      const result = await registrationService.registerUser(validRegisterData)

      // Verify
      expect(result.user._id).toBe('test-user-id-123')
      expect(result.user.email).toBe('john@example.com')
      expect(result.user.status).toBe('pending')
      expect(result.message).toMatch(/registration successful/gi)

      // Verify email was sent
      const sentEmails = mockEmailService.getSentEmails()
      expect(sentEmails).toHaveLength(1)
      expect(sentEmails[0].to).toBe('john@example.com')
      expect(sentEmails[0].subject).toBe('Verifica tu cuenta - AdaptCV')
    })

    it('should throw error for invalid email format', async () => {
      const invalidData = {
        ...validRegisterData,
        email: 'invalid-email'
      }

      await expect(
        registrationService.registerUser(invalidData)
      ).rejects.toThrow()
    })

    it('should throw error for short password', async () => {
      const invalidData = {
        ...validRegisterData,
        password: '123'
      }

      await expect(
        registrationService.registerUser(invalidData)
      ).rejects.toThrow()
    })

    it('should throw error for short name', async () => {
      const invalidData = {
        ...validRegisterData,
        name: 'A'
      }

      await expect(
        registrationService.registerUser(invalidData)
      ).rejects.toThrow()
    })

    it('should throw error for existing email', async () => {
      // Setup: email already exists
      vi.mocked(mockUserRepository.findOne).mockResolvedValue({
        _id: 'existing-user',
        email: 'john@example.com'
      } as IUsers)

      await expect(
        registrationService.registerUser(validRegisterData)
      ).rejects.toThrow()

      // Verify no email was sent
      expect(mockEmailService.getSentEmails()).toHaveLength(0)
    })

    it('should handle user creation failure', async () => {
      // Setup mocks
      vi.mocked(mockUserRepository.findOne).mockResolvedValue({} as IUsers)
      vi.mocked(mockUserRepository.create).mockResolvedValue({} as IUsers)

      await expect(
        registrationService.registerUser(validRegisterData)
      ).rejects.toThrow()
    })
  })

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Setup verification service mock
      vi.mocked(mockVerificationService.verifyToken).mockResolvedValue({
        success: true,
        userId: 'test-user-id',
        email: 'john@example.com',
        message: 'Email verified successfully'
      })

      // Setup mocks
      vi.mocked(mockUserRepository.findOne).mockResolvedValue({
        _id: 'test-user-id',
        email: 'john@example.com',
        status: 'pending'
      } as IUsers)

      vi.mocked(mockUserRepository.update).mockResolvedValue({} as any)

      // Execute
      const result = await registrationService.verifyEmail('valid-token')

      // Verify
      expect(result.success).toBe(true)
      expect(result.message).toContain('verified')
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { _id: 'test-user-id' },
        { $set: { status: 'active' } }
      )
    })

    it('should handle already verified user', async () => {
      // Setup verification service mock
      vi.mocked(mockVerificationService.verifyToken).mockResolvedValue({
        success: true,
        userId: 'test-user-id',
        email: 'john@example.com',
        message: 'Email verified successfully'
      })

      // Setup: user already active
      vi.mocked(mockUserRepository.findOne).mockResolvedValue({
        _id: 'test-user-id',
        email: 'john@example.com',
        status: 'active'
      } as IUsers)

      // Execute
      const result = await registrationService.verifyEmail('valid-token')

      // Verify
      expect(result.success).toBe(true)
      expect(result.message).toContain('already verified')
      expect(mockUserRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      // Setup verification service mocks
      vi.mocked(mockVerificationService.hasPendingToken).mockResolvedValue(
        false
      )
      vi.mocked(
        mockVerificationService.generateVerificationToken
      ).mockReturnValue('new-token')
      vi.mocked(
        mockVerificationService.generateVerificationUrl
      ).mockReturnValue('http://localhost:3000/verify?token=new-token')

      // Setup mocks
      vi.mocked(mockUserRepository.findOne).mockResolvedValue({
        _id: 'test-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'pending'
      } as IUsers)

      // Execute
      const result =
        await registrationService.resendVerificationEmail('john@example.com')

      // Verify
      expect(result.success).toBe(true)
      expect(result.message).toContain('sent')

      // Verify email was sent
      const sentEmails = mockEmailService.getSentEmails()
      expect(sentEmails).toHaveLength(1)
      expect(sentEmails[0].to).toBe('john@example.com')
    })

    it('should handle non-existent user', async () => {
      vi.mocked(mockUserRepository.findOne).mockResolvedValue({})

      await expect(
        registrationService.resendVerificationEmail('nonexistent@example.com')
      ).rejects.toThrow()
    })

    it('should handle already verified user', async () => {
      vi.mocked(mockUserRepository.findOne).mockResolvedValue({
        _id: 'test-user-id',
        email: 'john@example.com',
        status: 'active'
      } as IUsers)

      const result =
        await registrationService.resendVerificationEmail('john@example.com')

      expect(result.success).toBe(false)
      expect(result.message).toContain('already verified')
      expect(mockEmailService.getSentEmails()).toHaveLength(0)
    })
  })
})
