import { UserRepositoryMongo } from '@Api/Users/repository/users.repository.mongo'
import { CleanupService } from '@src/services/cleanup/cleanup.service'
import { CronJobsInitializer } from './cron.initializer'

const userRepository = new UserRepositoryMongo()
export const cleanupService = new CleanupService(userRepository)
export const cronJobsInitializer = new CronJobsInitializer(cleanupService)
