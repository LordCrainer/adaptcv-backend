import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '@src/config/environments'
import { CleanupService } from '@src/services/cleanup/cleanup.service'
import { CronJobsInitializer } from '@src/services/cron/cron.initializer'

import { UserRepositoryMongo } from '@Api/Users/repository/users.repository.mongo'

// Mock config
vi.mock('@src/config/environments', () => ({
  default: {
    isProduction: false
  }
}))

// Mock UserRepositoryMongo
vi.mock('@Api/Users/repository/users.repository.mongo', () => ({
  UserRepositoryMongo: vi.fn().mockImplementation(() => ({
    find: vi.fn(),
    deleteMany: vi.fn()
  }))
}))

describe('CronJobsInitializer Integration', () => {
  let cronJobsInitializer: CronJobsInitializer
  let cleanupService: CleanupService
  let mockUserRepository: any

  beforeEach(() => {
    // Reset config mock to default state
    vi.mocked(config).isProduction = false
    
    // Create fresh instances
    mockUserRepository = new UserRepositoryMongo()
    cleanupService = new CleanupService(mockUserRepository)
    cronJobsInitializer = new CronJobsInitializer(cleanupService)
    
    // Clear any existing jobs from the singleton cronManager
    cronJobsInitializer.getCronManager().reset()
  })

  afterEach(() => {
    // Clean up after each test
    cronJobsInitializer.getCronManager().reset()
    
    // Reset mock to default state
    vi.mocked(config).isProduction = false
  })

  describe('initializeJobs', () => {
    it('should register cleanup job', () => {
      cronJobsInitializer.initializeJobs()

      const cronManager = cronJobsInitializer.getCronManager()
      const jobs = cronManager.getJobsStatus()

      expect(jobs).toHaveLength(1)
      expect(jobs[0]).toEqual({
        name: 'cleanup-unverified-users',
        schedule: '0 3 * * *',
        enabled: false, // Should be false since isProduction is false
        running: false
      })
    })

    it('should start jobs in production environment', () => {
      // Mock production environment
      vi.mocked(config).isProduction = true

      cronJobsInitializer.initializeJobs()

      const cronManager = cronJobsInitializer.getCronManager()
      const jobs = cronManager.getJobsStatus()
      expect(jobs[0].enabled).toBe(true)
      expect(jobs[0].running).toBe(true)
    })

    it('should not start jobs in non-production environment', () => {
      // Ensure non-production environment
      vi.mocked(config).isProduction = false

      cronJobsInitializer.initializeJobs()

      const cronManager = cronJobsInitializer.getCronManager()
      const jobs = cronManager.getJobsStatus()

      expect(jobs[0].enabled).toBe(false)
      expect(jobs[0].running).toBe(false)
    })
  })

  describe('manual job execution', () => {
    it('should be able to run cleanup job manually', async () => {
      mockUserRepository.find.mockResolvedValue([
        { _id: 'user1', email: 'test@example.com', status: 'pending' }
      ])
      mockUserRepository.deleteMany.mockResolvedValue({ deletedCount: 1 })

      cronJobsInitializer.initializeJobs()

      const cronManager = cronJobsInitializer.getCronManager()
      await cronManager.runJobNow('cleanup-unverified-users')

      expect(mockUserRepository.find).toHaveBeenCalled()
      expect(mockUserRepository.deleteMany).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle cleanup service errors gracefully', async () => {
      mockUserRepository.find.mockRejectedValue(
        new Error('Database connection failed')
      )

      cronJobsInitializer.initializeJobs()

      const cronManager = cronJobsInitializer.getCronManager()

      // Should not throw error, but log it
      await expect(
        cronManager.runJobNow('cleanup-unverified-users')
      ).resolves.not.toThrow('Database connection failed')
    })
  })
})
