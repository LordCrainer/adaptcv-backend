import { afterAll, beforeAll } from 'vitest'

import {
  closeRedisConnection,
  redisClient,
  redisConnection
} from '@src/config/cache/redis'
import currentEnv from '@src/config/environments'

export async function setupINT() {
  await redisConnection(currentEnv.dataBase.redis.uri)
  beforeAll(async () => {
    if (currentEnv.environment === 'test') {
      await redisConnection(currentEnv.dataBase.redis.uri)
    }
  })

  afterAll(async () => {
    if (redisClient) {
      await closeRedisConnection()
    }
  })
}

await setupINT()
