import config from '@src/config/environments'
import Logger from '@src/lib/logger'
import { CleanupService } from '@src/services/cleanup/cleanup.service'
import { cronManager } from '@src/services/cron/cron.manager'

export class CronJobsInitializer {
  constructor(private readonly cleanupService: CleanupService) {}

  /**
   * Initialize and register all cron jobs
   */
  initializeJobs(): void {
    // Register cleanup job for unverified users
    cronManager.registerJob({
      name: 'cleanup-unverified-users',
      schedule: '0 3 * * *', // Every day at 3:00 AM
      task: async () => {
        const deletedCount = await this.cleanupService.cleanupUnverifiedUsers()
        Logger.info(
          `Cleanup job completed. Deleted ${deletedCount} unverified users`
        )
      },
      enabled: config?.isProduction // Only run in production
    })

    // Start all jobs if in production
    if (config.isProduction) {
      cronManager.startAllJobs()
      Logger.info('All cron jobs started for production environment')
    } else {
      Logger.info(
        'Cron jobs registered but not started (non-production environment)'
      )
    }
  }

  /**
   * Get cron manager instance for testing or manual operations
   */
  getCronManager() {
    return cronManager
  }
}
