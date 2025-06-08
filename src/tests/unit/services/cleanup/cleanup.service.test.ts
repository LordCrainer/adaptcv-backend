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
      deleteMany: vi.fn()
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

      mockUserRepository.find.mockResolvedValue(mockUsers)
      mockUserRepository.deleteMany.mockResolvedValue({
        deletedCount: 2
      } as any)

      const result = await cleanupService.cleanupUnverifiedUsers()

      expect(result).toBe(2)
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        status: 'pending',
        createdAt: { $lt: expect.any(Date) }
      })
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
      mockUserRepository.find.mockResolvedValue([])

      const result = await cleanupService.cleanupUnverifiedUsers()

      expect(result).toBe(0)
      expect(mockUserRepository.deleteMany).not.toHaveBeenCalled()
      expect(Logger.info).toHaveBeenCalledWith('No unverified users to cleanup')
    })

    it('should handle errors and rethrow them', async () => {
      const error = new Error('Database error')
      mockUserRepository.find.mockRejectedValue(error)

      await expect(cleanupService.cleanupUnverifiedUsers()).rejects.toThrow(
        'Database error'
      )
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to cleanup unverified users',
        error
      )
    })

    it('should use correct date calculation for 7 days ago', async () => {
      mockUserRepository.find.mockResolvedValue([])

      await cleanupService.cleanupUnverifiedUsers()

      const findCall = mockUserRepository.find.mock.calls[0][0]
      const cutoffDate = findCall.createdAt.$lt
      const now = new Date()
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Allow for a small time difference due to test execution time
      const timeDiff = Math.abs(cutoffDate.getTime() - sevenDaysAgo.getTime())
      expect(timeDiff).toBeLessThan(1000) // Less than 1 second difference
    })
  })
})
