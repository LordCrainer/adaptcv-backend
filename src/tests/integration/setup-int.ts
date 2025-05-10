import { afterAll } from 'vitest'

import {
  closeRedisConnection,
  redisClient,
  redisConnection
} from '@src/config/cache/redis'

export async function setupINT() {
  await redisConnection()

  afterAll(async () => {
    if (redisClient) {
      await closeRedisConnection()
    }
  })
}

await setupINT()
