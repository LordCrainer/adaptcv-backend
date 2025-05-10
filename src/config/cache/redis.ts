import redis from 'redis'

import type { RedisClientType } from 'redis'

import Logger from '@src/lib/logger'

import currentEnv from '../environments'

let redisClient: RedisClientType

const redisConnection = async (uri: string) => {
  console.log('Redis connection', uri, currentEnv?.dataBase?.redis?.uri)
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = redis.createClient({
      url: uri || currentEnv?.dataBase?.redis?.uri
    })
    await redisClient.connect()

    Logger.info(`🫙 Connected to Redis ${uri}`)

    redisClient.on('error', (err: Error) =>
      Logger.error('Redis Client Error', err)
    )

    return redisClient
  } catch (error: Error | any) {
    console.log('Redis connection error', error)
    Logger.error('Redis connection error:', error)
    throw new Error(`Redis connection error: ${error?.message}`)
  }
}

const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit()
    if (currentEnv?.environment === 'test') {
      console.log('Redis connection closed')
    }
    Logger.info('🔌 Redis connection closed')
  } else {
    Logger.warn('No Redis client to close')
  }
}

export { redisClient, redisConnection, closeRedisConnection }
