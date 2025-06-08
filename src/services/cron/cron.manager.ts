import cron from 'node-cron'

import type { ScheduledTask } from 'node-cron'

import Logger from '@src/lib/logger'

export interface CronJob {
  name: string
  schedule: string
  task: () => Promise<void> | void
  enabled: boolean
}

export class CronManager {
  private jobs: Map<string, ScheduledTask> = new Map()
  private registeredJobs: CronJob[] = []

  /**
   * Register a new cron job
   * @param job - The cron job configuration
   */
  registerJob(job: CronJob): void {
    if (this.jobs.has(job.name)) {
      Logger.warn(`Cron job '${job.name}' is already registered`)
      return
    }

    this.registeredJobs.push(job)

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
    const job = this.registeredJobs.find((j) => j.name === jobName)
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
    this.registeredJobs
      .filter((job) => job.enabled)
      .forEach((job) => {
        if (!this.jobs.has(job.name)) {
          this.startJob(job.name)
        }
      })
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
   * Get the status of all jobs
   */
  getJobsStatus(): Array<{
    name: string
    schedule: string
    enabled: boolean
    running: boolean
  }> {
    return this.registeredJobs.map((job) => ({
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
    const job = this.registeredJobs.find((j) => j.name === jobName)
    if (!job) {
      throw new Error(`Cron job '${jobName}' not found`)
    }

    Logger.info(`Running cron job immediately: ${jobName}`)
    await job.task()
    Logger.info(`Completed immediate run of cron job: ${jobName}`)
  }
}

// Singleton instance
export const cronManager = new CronManager()
