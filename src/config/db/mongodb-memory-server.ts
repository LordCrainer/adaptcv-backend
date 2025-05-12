import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import currentEnv from '../environments'
import { BaseDb } from './dbStrategy'

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
    } catch (error) {
      console.error('Error in clear method', error)
      throw new Error('Error in clear method')
    }
  }
}
