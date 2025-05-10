import http from 'http'

import { redisConnection } from './config/cache/redis'
import mongoConnection from './config/db/mongo'
import environments from './config/environments/index'
import app from './config/server/index'
import Logger from './lib/logger'

const main = async () => {
  try {
    await mongoConnection(environments.dataBase.mongo.url)
    await redisConnection(environments.dataBase.redis.uri)

    const server: http.Server = http.createServer(app)

    server.listen(app.get('port'), () =>
      Logger.info(`💻 http://${environments.server.host}:${app.get('port')}`)
    )
  } catch (error) {
    Logger.error(error)
  }
}

main()
