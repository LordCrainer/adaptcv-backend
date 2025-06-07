import type { RedisClientType } from 'redis'

import { redisClient } from '@src/config/cache/redis'

export class RedisService {
  private redis: RedisClientType

  constructor(redisClient: RedisClientType) {
    this.redis = redisClient
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setEx(key, ttl, value)
    } else {
      await this.redis.set(key, value)
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key)
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }

  async flushAll(): Promise<void> {
    await this.redis.flushAll()
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern)
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds)
  }
}

export const redisService = new RedisService(redisClient)
