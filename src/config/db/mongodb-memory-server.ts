import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import currentEnv from '../environments'
import { BaseDb } from './dbStrategy'

let mongoServer: MongoMemoryServer | null = null
/**
 * Connect to the in-memory database.
 */
export const connection = async (dbName = 'acv-test') => {
  try {
    if (mongoServer) {
      return
    }
    mongoServer = await MongoMemoryServer.create({
      instance: currentEnv.dataBase.mongo?.enableInstance
        ? {
            dbName
            // dbPath: './data/mongodb-memory',
          }
        : undefined
    })

    const uri = mongoServer.getUri()
    await mongoose.connect(uri, {})
    console.log('Connected to MongoDb Memory, db: ', dbName)
  } catch (error) {
    console.error('Error in connection', error)
    throw new Error('Error in connection')
  }
}

/**
 * Clear the in-memory database between tests.
 */
export const clearDatabase = async () => {
  try {
    if (currentEnv.debugs?.skipClear) return

    const collections = mongoose.connection.collections
    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany({})
    }
  } catch (error) {
    console.error('Error in clearDatabase', error)
    throw new Error('Error in clearDatabase')
  }
}

/**
 * Disconnect from the in-memory database.
 */
export const disconnect = async () => {
  console.log('Disconnecting from MongoDb Memory')
  await mongoose.disconnect()
  await mongoServer?.stop()
}

export class MongoMemoryServerStrategy implements BaseDb {
  private mongoServer!: MongoMemoryServer

  async connect(dbName?: string) {
    try {
      if (this.mongoServer) {
        return
      }
      this.mongoServer = await MongoMemoryServer.create({
        instance: currentEnv.dataBase.mongo?.enableInstance
          ? {
              dbName
              // dbPath: './data/mongodb-memory',
            }
          : undefined
      })

      const uri = this.mongoServer.getUri()
      await mongoose.connect(uri, {})
    } catch (error) {
      console.error('Error in connection', error)
      throw new Error('Error in connection')
    }
  }

  async disconnect() {
    await mongoose.disconnect()
    await this.mongoServer?.stop()
  }

  async clear(): Promise<void> {
    try {
      if (currentEnv.debugs?.skipClear) return

      const collections = mongoose.connection.collections
      for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany({})
      }
      console.log('Cleared all collections in MongoDb Memory')
    } catch (error) {
      console.error('Error in clear method', error)
      throw new Error('Error in clear method')
    }
  }
}
