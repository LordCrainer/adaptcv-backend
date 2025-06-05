import redis from 'redis'

import type { RedisClientType } from 'redis'

import Logger from '@src/lib/logger'

import currentEnv from '../environments'

let redisClient: RedisClientType

const redisConnection = async (uri: string) => {
  if (redisClient) {
    return redisClient
  }
  let selectedUri = uri || currentEnv?.dataBase?.redis?.uri

  try {
    redisClient = redis.createClient({
      url: selectedUri
    })
    await redisClient.connect()

    Logger.info(`🫙  Connected to Redis ${selectedUri}`)

    redisClient.on('error', (err: Error) =>
      Logger.error('Redis Client Error', err)
    )

    return redisClient
  } catch (error: Error | any) {
    Logger.error(`Redis connection error:  ${error} ${selectedUri}`)
    throw new Error(`Redis connection error: ${error?.message}`)
  }
}

const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit()
    Logger.info('🔌 Redis closed')
  } else {
    Logger.warn('No Redis client to close')
  }
}

export { redisClient, redisConnection, closeRedisConnection }
