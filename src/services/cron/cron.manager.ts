import cron from 'node-cron'

import type { ScheduledTask } from 'node-cron'

import Logger from '@src/lib/logger'
import { customError } from '@src/Shared/utils/errorUtils'

export interface CronJob {
  name: string
  schedule: string
  task: () => Promise<void> | void
  enabled: boolean
}

export class CronManager {
  private jobs: Map<string, ScheduledTask> = new Map()
  private registeredJobs: Map<string, CronJob> = new Map()

  /**
   * Register a new cron job
   * @param job - The cron job configuration
   */
  registerJob(job: CronJob): void {
    if (this.registeredJobs.has(job.name)) {
      Logger.warn(`Cron job '${job.name}' is already registered`)
      return
    }

    this.registeredJobs.set(job.name, job)

    if (job.enabled) {
      this.startJob(job.name)
    }

    Logger.info(
      `Cron job '${job.name}' registered with schedule: ${job.schedule}`
    )
  }

  /**
   * Start a specific job by name
   * @param jobName - The name of the job to start
   */
  startJob(jobName: string): boolean {
    const job = this.registeredJobs.get(jobName)
    if (!job) {
      Logger.error(`Cron job '${jobName}' not found`)
      return false
    }

    if (this.jobs.has(jobName)) {
      Logger.warn(`Cron job '${jobName}' is already running`)
      return false
    }

    const task = cron.schedule(
      job.schedule,
      async () => {
        try {
          Logger.info(`Starting cron job: ${jobName}`)
          await job.task()
          Logger.info(`Completed cron job: ${jobName}`)
        } catch (error) {
          Logger.error(`Error in cron job '${jobName}':`, error)
        }
      },
      {
        noOverlap: true,
        timezone: 'UTC'
      }
    )

    task.start()
    this.jobs.set(jobName, task)
    Logger.info(`Cron job '${jobName}' started`)
    return true
  }

  /**
   * Stop a specific job by name
   * @param jobName - The name of the job to stop
   */
  stopJob(jobName: string): boolean {
    const task = this.jobs.get(jobName)
    if (!task) {
      Logger.warn(`Cron job '${jobName}' is not running`)
      return false
    }

    task.stop()
    this.jobs.delete(jobName)
    Logger.info(`Cron job '${jobName}' stopped`)
    return true
  }

  /**
   * Start all registered and enabled jobs
   */
  startAllJobs(): void {
    for (const [jobName, job] of this.registeredJobs) {
      if (job.enabled && !this.jobs.has(jobName)) {
        this.startJob(jobName)
      }
    }
  }

  /**
   * Stop all running jobs
   */
  stopAllJobs(): void {
    for (const [jobName] of this.jobs) {
      this.stopJob(jobName)
    }
  }

  /**
   * Clear all registered jobs (useful for testing)
   * WARNING: This is intended for testing purposes only
   */
  clearAllJobs(): void {
    this.stopAllJobs()
    this.registeredJobs.clear()
    this.jobs.clear()
    Logger.info('All cron jobs cleared')
  }

  /**
   * Reset the cron manager to initial state (useful for testing)
   * WARNING: This is intended for testing purposes only
   */
  reset(): void {
    this.clearAllJobs()
  }

  /**
   * Get the status of all jobs
   */
  getJobsStatus(): Array<{
    name: string
    schedule: string
    enabled: boolean
    running: boolean
  }> {
    return Array.from(this.registeredJobs.values()).map((job) => ({
      name: job.name,
      schedule: job.schedule,
      enabled: job.enabled,
      running: this.jobs.has(job.name)
    }))
  }

  /**
   * Run a job immediately (useful for testing)
   * @param jobName - The name of the job to run
   */
  async runJobNow(jobName: string): Promise<void> {
    const job = this.registeredJobs.get(jobName)
    if (!job) {
      throw new Error(`Cron job '${jobName}' not found`)
    }

    try {
      Logger.info(`Running cron job immediately: ${jobName}`)
      await job.task()
      Logger.info(`Completed immediate run of cron job: ${jobName}`)
    } catch (error: any) {
      Logger.error(`Error in immediate cron job '${jobName}':`, error)
      throw new Error(error)
    }
  }
}

// Singleton instance
export const cronManager = new CronManager()
