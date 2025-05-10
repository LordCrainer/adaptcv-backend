import { afterAll } from 'vitest'

import {
  closeRedisConnection,
  redisClient,
  redisConnection
} from '@src/config/cache/redis'
import {
  clearDatabase,
  connectToMemoryDB
} from '@src/config/db/mongodb-memory-server'

// import { seedSuperAdminDb } from '../seeders/users.seeder'

export async function setupE2E() {
  await connectToMemoryDB('lntv-e2e-test')
  await redisConnection()
  await clearDatabase()
  // await seedSuperAdminDb()

  afterAll(async () => {
    if (redisClient) {
      await closeRedisConnection()
    }
  })
}

await setupE2E()
