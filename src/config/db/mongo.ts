import mongoose from 'mongoose'

import type { BaseDb } from './dbStrategy'

import Logger from '@src/lib/logger'

export const connection = async (path: string) => {
  try {
    return await mongoose.connect(path)
  } catch (err: any) {
    Logger.error(`❌ ${err.message}`)
    process.exit(1)
  }
}

mongoose.connection.on('connected', () => {
  Logger.info('🔗 Connected to MongoDB')
})

mongoose.connection.on('reconnect', () => {
  Logger.info('🔁 Reconnected to MongoDB')
})

mongoose.connection.on('disconnected', () => {
  Logger.info('❌ Disconnected from MongoDB')
})

export const mongoDisconnect = async () => {
  try {
    await mongoose.connection.close()
    Logger.info('🔌 MongoDB connection closed')
  } catch (err: any) {
    Logger.error(`❌ ${err.message}`)
  }
}

export const mongoClear = async () => {
  try {
    const db = mongoose.connection.db
    const collections = Object.keys(mongoose.connection.collections)

    for (const name of collections) {
      await db?.dropCollection(name)
    }

    Logger.info('🗑️  MongoDB collections cleared')
  } catch (err: any) {
    Logger.error(`❌ ${err.message}`)
  }
}

export class MongoStrategy implements BaseDb {
  async connect(path?: string) {
    if (!path) {
      throw new Error('Connection path is required')
    }
    try {
      await mongoose.connect(path)
    } catch (err: any) {
      Logger.error(`❌ ${err.message}`)
      process.exit(1)
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close()
      Logger.info('🔌 MongoDB connection closed')
    } catch (err: any) {
      Logger.error(`❌ ${err.message}`)
    }
  }

  async clear() {
    return mongoClear()
  }
}
