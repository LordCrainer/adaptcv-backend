import { IUsers } from '@lordcrainer/adaptcv-shared-types'
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest'

import { UserRepository } from '@src/api/Users/interfaces/users.repository'
import Logger from '@src/lib/logger'
import { CleanupService } from '@src/services/cleanup/cleanup.service'

// Mock Logger
vi.mock('@src/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('CleanupService', () => {
  let cleanupService: CleanupService
  let mockUserRepository: Mocked<UserRepository>

  beforeEach(() => {
    mockUserRepository = {
      find: vi.fn(),
      deleteMany: vi.fn(),
      findUnverifiedUsersOlderThan: vi.fn()
    } as any

    cleanupService = new CleanupService(mockUserRepository)
    vi.clearAllMocks()
  })

  describe('cleanupUnverifiedUsers', () => {
    it('should remove unverified users older than 7 days', async () => {
      const mockUsers: IUsers[] = [
        {
          _id: 'user1',
          email: 'user1@test.com',
          status: 'pending',
          name: 'User One'
        },
        {
          _id: 'user2',
          email: 'user2@test.com',
          status: 'pending',
          name: 'User Two'
        }
      ]

      mockUserRepository.findUnverifiedUsersOlderThan.mockResolvedValue(
        mockUsers
      )
      mockUserRepository.deleteMany.mockResolvedValue({
        deletedCount: 2
      } as any)

      const result = await cleanupService.cleanupUnverifiedUsers()

      expect(result).toBe(2)
      expect(
        mockUserRepository.findUnverifiedUsersOlderThan
      ).toHaveBeenCalledWith(expect.any(Date))
      expect(mockUserRepository.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ['user1', 'user2'] }
      })
      expect(Logger.info).toHaveBeenCalledWith(
        'Cleaned up 2 unverified users',
        expect.objectContaining({
          userIds: ['user1', 'user2'],
          cutoffDate: expect.any(Date)
        })
      )
    })

    it('should return 0 when no unverified users found', async () => {
      mockUserRepository.findUnverifiedUsersOlderThan.mockResolvedValue([])

      const result = await cleanupService.cleanupUnverifiedUsers()

      expect(result).toBe(0)
      expect(mockUserRepository.deleteMany).not.toHaveBeenCalled()
      expect(Logger.info).toHaveBeenCalledWith('No unverified users to cleanup')
    })

    it('should handle errors and rethrow them', async () => {
      const error = new Error('Database error')
      mockUserRepository.findUnverifiedUsersOlderThan.mockRejectedValue(error)

      await expect(cleanupService.cleanupUnverifiedUsers()).rejects.toThrow(
        'Database error'
      )
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to cleanup unverified users',
        error
      )
    })

    it('should use correct date calculation for 7 days ago', async () => {
      mockUserRepository.findUnverifiedUsersOlderThan.mockResolvedValue([])

      await cleanupService.cleanupUnverifiedUsers()

      // Get the cutoff date that was passed to the repository
      const cutoffDateCall =
        mockUserRepository.findUnverifiedUsersOlderThan.mock.calls[0][0]

      // Calculate expected date (7 days ago)
      const expectedCutoffDate = new Date()
      expectedCutoffDate.setDate(expectedCutoffDate.getDate() - 7)

      const timeDiff = Math.abs(
        cutoffDateCall.getTime() - expectedCutoffDate.getTime()
      )
      expect(timeDiff).toBeLessThan(1000) // Less than 1 second difference
    })

    it('should calculate cutoff date correctly for different day values', async () => {
      // Test the private method behavior indirectly by checking the date passed to repository
      mockUserRepository.findUnverifiedUsersOlderThan.mockResolvedValue([])

      await cleanupService.cleanupUnverifiedUsers()

      const cutoffDateCall =
        mockUserRepository.findUnverifiedUsersOlderThan.mock.calls[0][0]

      // Verify it's actually 7 days in the past
      const daysDifference = Math.round(
        (new Date().getTime() - cutoffDateCall.getTime()) /
          (1000 * 60 * 60 * 24)
      )
      expect(daysDifference).toBe(7)
    })
  })
})
