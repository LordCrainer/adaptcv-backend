import mongoose from 'mongoose'

import Logger from '@src/lib/logger'

const mongoConnection = async (path: string) => {
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

export default mongoConnection
