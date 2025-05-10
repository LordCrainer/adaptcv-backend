import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import currentEnv from '../environments'

let mongoServer: MongoMemoryServer | null = null
/**
 * Connect to the in-memory database.
 */
export const connectToMemoryDB = async (dbName = 'lntv-test') => {
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
    console.error('Error in connectToMemoryDB', error)
    throw new Error('Error in connectToMemoryDB')
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
export const disconnectFromMemoryDB = async () => {
  console.log('Disconnecting from MongoDb Memory')
  await mongoose.disconnect()
  await mongoServer?.stop()
}
