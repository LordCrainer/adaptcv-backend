import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import Logger from '@src/lib/logger'
import { CronJob, CronManager } from '@src/services/cron/cron.manager'

// Mock Logger
vi.mock('@src/lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

// Mock node-cron with hoisted variables
const { mockSchedule, mockTask } = vi.hoisted(() => {
  const mockTask = {
    start: vi.fn(),
    stop: vi.fn()
  }

  const mockSchedule = vi.fn().mockReturnValue(mockTask)

  return { mockSchedule, mockTask }
})

vi.mock('node-cron', () => ({
  default: {
    schedule: mockSchedule
  }
}))

describe('CronManager', () => {
  let cronManager: CronManager
  let mockJobTask: Mock

  beforeEach(() => {
    cronManager = new CronManager()
    mockJobTask = vi.fn()
    mockSchedule.mockReturnValue(mockTask)
    vi.clearAllMocks()
  })

  afterEach(() => {
    cronManager.stopAllJobs()
  })

  describe('registerJob', () => {
    it('should register a new cron job', () => {
      const job: CronJob = {
        name: 'test-job',
        schedule: '* * * * * *',
        task: mockJobTask,
        enabled: true
      }

      cronManager.registerJob(job)

      const status = cronManager.getJobsStatus()
      expect(status).toHaveLength(1)
      expect(status[0]).toEqual({
        name: 'test-job',
        schedule: '* * * * * *',
        enabled: true,
        running: true
      })

      expect(Logger.info).toHaveBeenCalledWith(
        "Cron job 'test-job' registered with schedule: * * * * * *"
      )
    })

    it('should handle every-second schedule correctly', () => {
      const job: CronJob = {
        name: 'every-second-job',
        schedule: '* * * * * *',
        task: mockJobTask,
        enabled: true
      }

      cronManager.registerJob(job)

      expect(mockSchedule).toHaveBeenCalledWith(
        '* * * * * *',
        expect.any(Function),
        {
          noOverlap: true,
          timezone: 'UTC'
        }
      )
      expect(mockTask.start).toHaveBeenCalled()
    })

    it('should not start job if not enabled', () => {
      const job: CronJob = {
        name: 'disabled-job',
        schedule: '0 0 * * *',
        task: mockJobTask,
        enabled: false
      }

      cronManager.registerJob(job)

      const status = cronManager.getJobsStatus()
      expect(status[0].running).toBe(false)
      expect(mockSchedule).not.toHaveBeenCalled()
    })

    it('should warn when registering duplicate job', () => {
      const job: CronJob = {
        name: 'duplicate-job',
        schedule: '0 0 * * *',
        task: mockJobTask,
        enabled: true
      }

      cronManager.registerJob(job)

      // Clear previous calls to get a clean state
      vi.clearAllMocks()

      cronManager.registerJob(job)

      expect(Logger.warn).toHaveBeenCalledWith(
        "Cron job 'duplicate-job' is already registered"
      )

      // Should not register twice
      const status = cronManager.getJobsStatus()
      expect(status).toHaveLength(1)
    })
  })

  describe('startJob', () => {
    it('should start a registered job', () => {
      const job: CronJob = {
        name: 'start-test',
        schedule: '0 0 * * *',
        task: mockJobTask,
        enabled: false
      }

      cronManager.registerJob(job)
      const result = cronManager.startJob('start-test')

      expect(result).toBe(true)
      expect(mockSchedule).toHaveBeenCalledWith(
        '0 0 * * *',
        expect.any(Function),
        {
          noOverlap: true,
          timezone: 'UTC'
        }
      )
      expect(mockTask.start).toHaveBeenCalled()
    })

    it('should return false for non-existent job', () => {
      const result = cronManager.startJob('non-existent')

      expect(result).toBe(false)
      expect(Logger.error).toHaveBeenCalledWith(
        "Cron job 'non-existent' not found"
      )
    })
  })

  describe('stopJob', () => {
    it('should stop a running job', () => {
      const job: CronJob = {
        name: 'stop-test',
        schedule: '0 0 * * *',
        task: mockJobTask,
        enabled: true
      }

      cronManager.registerJob(job)
      const result = cronManager.stopJob('stop-test')

      expect(result).toBe(true)
      expect(mockTask.stop).toHaveBeenCalled()
    })

    it('should return false for non-running job', () => {
      const result = cronManager.stopJob('non-running')

      expect(result).toBe(false)
      expect(Logger.warn).toHaveBeenCalledWith(
        "Cron job 'non-running' is not running"
      )
    })
  })

  describe('runJobNow', () => {
    it('should execute job task immediately', async () => {
      const job: CronJob = {
        name: 'immediate-test',
        schedule: '0 0 * * *',
        task: mockJobTask,
        enabled: false
      }

      cronManager.registerJob(job)
      await cronManager.runJobNow('immediate-test')

      expect(mockJobTask).toHaveBeenCalled()
      expect(Logger.info).toHaveBeenCalledWith(
        'Running cron job immediately: immediate-test'
      )
    })

    it('should throw error for non-existent job', async () => {
      await expect(cronManager.runJobNow('non-existent')).rejects.toThrow(
        "Cron job 'non-existent' not found"
      )
    })
  })

  describe('job execution', () => {
    it('should handle successful job execution', async () => {
      const job: CronJob = {
        name: 'success-test',
        schedule: '0 0 * * *',
        task: mockJobTask,
        enabled: true
      }

      cronManager.registerJob(job)

      // Get the scheduled task function and execute it
      const scheduledFunction = mockSchedule.mock.calls[0][1]
      await scheduledFunction()

      expect(mockJobTask).toHaveBeenCalled()
      expect(Logger.info).toHaveBeenCalledWith(
        'Starting cron job: success-test'
      )
      expect(Logger.info).toHaveBeenCalledWith(
        'Completed cron job: success-test'
      )
    })

    it('should handle job execution errors', async () => {
      const errorJob: CronJob = {
        name: 'error-test',
        schedule: '0 0 * * *',
        task: vi.fn().mockRejectedValue(new Error('Job failed')),
        enabled: true
      }

      cronManager.registerJob(errorJob)

      // Get the scheduled task function and execute it
      const scheduledFunction = mockSchedule.mock.calls[0][1]
      await scheduledFunction()

      expect(Logger.error).toHaveBeenCalledWith(
        "Error in cron job 'error-test':",
        expect.any(Error)
      )
    })
  })

  describe('job management', () => {
    it('should start all enabled jobs', () => {
      const jobs: CronJob[] = [
        { name: 'job1', schedule: '0 0 * * *', task: vi.fn(), enabled: true },
        { name: 'job2', schedule: '0 1 * * *', task: vi.fn(), enabled: false },
        { name: 'job3', schedule: '0 2 * * *', task: vi.fn(), enabled: true }
      ]

      jobs.forEach((job) => cronManager.registerJob(job))
      cronManager.startAllJobs()

      const status = cronManager.getJobsStatus()
      expect(status.filter((s) => s.running)).toHaveLength(2)
    })

    it('should stop all running jobs', () => {
      const jobs: CronJob[] = [
        { name: 'job1', schedule: '0 0 * * *', task: vi.fn(), enabled: true },
        { name: 'job2', schedule: '0 1 * * *', task: vi.fn(), enabled: true }
      ]

      jobs.forEach((job) => cronManager.registerJob(job))
      cronManager.stopAllJobs()

      const status = cronManager.getJobsStatus()
      expect(status.filter((s) => s.running)).toHaveLength(0)
    })

    it('should validate cron schedule syntax', () => {
      const validSchedules = [
        '* * * * * *', // Every second
        '0 * * * * *', // Every minute
        '0 0 * * *', // Daily at midnight
        '*/5 * * * * *', // Every 5 seconds
        '0 */15 * * * *' // Every 15 minutes
      ]

      validSchedules.forEach((schedule, index) => {
        const job: CronJob = {
          name: `schedule-test-${index}`,
          schedule,
          task: vi.fn(),
          enabled: true
        }

        cronManager.registerJob(job)

        expect(mockSchedule).toHaveBeenCalledWith(
          schedule,
          expect.any(Function),
          {
            noOverlap: true,
            timezone: 'UTC'
          }
        )
      })
    })
  })
})
