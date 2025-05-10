import redis, { RedisClientType } from 'redis'

import Logger from '@src/lib/logger'

import currentEnv from '../environments'

let redisClient: RedisClientType

const redisConnection = async (uri?: string) => {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = redis.createClient({
      url: uri || currentEnv?.dataBase?.redis?.uri
    })
    await redisClient.connect()

    if (currentEnv?.environment === 'test') {
      console.log('Connected to redis', currentEnv?.dataBase?.redis?.uri)
    }

    Logger.info(`🫙 Connected to Redis ${currentEnv?.dataBase?.redis?.uri}`)

    redisClient.on('error', (err) => Logger.error('Redis Client Error', err))

    return redisClient
  } catch (error) {
    Logger.error('Redis connection error:', error)
    throw new Error('Redis connection error')
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
