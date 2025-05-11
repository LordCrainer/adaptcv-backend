import { afterAll, beforeAll } from 'vitest'

import {
  closeRedisConnection,
  redisClient,
  redisConnection
} from '@src/config/cache/redis'
import { dbStrategy } from '@src/config/db/dbStrategy'
import currentEnv from '@src/config/environments'

import { seedSuperAdminDb } from '../seeders/users.seeder'

const selectedDb = dbStrategy.mongoMemory

export async function setupE2E() {
  beforeAll(async () => {
    console.log('Starting E2E tests...')
    if (currentEnv.environment === 'test') {
      await redisConnection(currentEnv.dataBase.redis.uri)

      await selectedDb.connect('acv-e2e-test')
      await seedSuperAdminDb()
    }
  })

  afterAll(async () => {
    console.log('Ending E2E tests...')
    if (redisClient) {
      await closeRedisConnection()
    }
    await selectedDb.disconnect()
  })
}

await setupE2E()
