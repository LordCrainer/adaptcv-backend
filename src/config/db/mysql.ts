import mysql from 'mysql2/promise'

import Logger from '@src/lib/logger'

import { Environments } from '../environments/environments.interface'

type MysqlConfig = Environments['dataBase']['mysql']

function formatMysqlUri(config: MysqlConfig) {
  const { host, user, password, database } = config || {}
  return `mysql://${user}:${password}@${host}/${database}`
}

const mysqlConnection = async (config: MysqlConfig) => {
  try {
    const uri = formatMysqlUri(config) || config?.uri
    if (!uri) {
      throw new Error('❌ MySQL URI is not defined')
    }
    const mysqlConnected = await mysql.createConnection(uri)
    Logger.info('💾 MySQL Connected')
    return mysqlConnected
  } catch (err: any) {
    Logger.error(`❌ ${err.message}`)
    process.exit(1)
  }
}

// mysql.on('reconnect', () => {
//   Logger.info(`🔁 Reconnected to MongoDB`);
// });

// mysql.connection.on('disconnected', () => {
//   Logger.info(`❌ Disconnected from MongoDB`);
// });

export default mysqlConnection
