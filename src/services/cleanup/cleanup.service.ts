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
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Find users with 'pending' status created more than 7 days ago
      const unverifiedUsers = await this.userRepository.find({
        status: 'pending',
        createdAt: { $lt: sevenDaysAgo }
      })

      if (unverifiedUsers.length === 0) {
        Logger.info('No unverified users to cleanup')
        return 0
      }

      // Delete unverified users
      const userIds = unverifiedUsers.map((user) => user._id)
      await this.userRepository.deleteMany({ _id: { $in: userIds } })

      Logger.info(`Cleaned up ${unverifiedUsers.length} unverified users`, {
        userIds,
        cutoffDate: sevenDaysAgo
      })

      return unverifiedUsers.length
    } catch (error) {
      Logger.error('Failed to cleanup unverified users', error)
      throw error
    }
  }
}
