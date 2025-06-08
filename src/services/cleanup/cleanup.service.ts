import cron from 'node-cron'

import { UserRepository } from '@src/api/Users/interfaces/users.repository'
import Logger from '@src/lib/logger'

export class CleanupService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Removes unverified users that are older than 7 days
   */
  async cleanupUnverifiedUsers(): Promise<number> {
    try {
      const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000
      const cutoffDate = this.getCutoffDate(SEVEN_DAYS_IN_MS)

      const unverifiedUsers =
        await this.userRepository.findUnverifiedUsersOlderThan(cutoffDate)

      if (unverifiedUsers.length === 0) {
        Logger.info('No unverified users to cleanup')
        return 0
      }

      // Delete unverified users
      const userIds = unverifiedUsers.map((user) => user._id)
      await this.userRepository.deleteMany({ _id: { $in: userIds } })

      Logger.info(`Cleaned up ${unverifiedUsers.length} unverified users`, {
        userIds,
        cutoffDate
      })

      return unverifiedUsers.length
    } catch (error) {
      Logger.error('Failed to cleanup unverified users', error)
      throw error
    }
  }

  private getCutoffDate(days: number): Date {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return cutoffDate
  }
}
