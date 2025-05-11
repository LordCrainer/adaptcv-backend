import http from 'http'

import { redisConnection } from './config/cache/redis'
import currentEnv from './config/environments/index'
import app from './config/server/index'
import Logger from './lib/logger'
import { dbStrategy } from './config/db/dbStrategy'

const main = async () => {
  try {
    await dbStrategy.mongo.connect(currentEnv.dataBase.mongo.url)
    await redisConnection(currentEnv.dataBase.redis.uri)

    const server: http.Server = http.createServer(app)

    server.listen(app.get('port'), () =>
      Logger.info(
        `💻 Connected to ${currentEnv.server.host}:${app.get('port')}`
      )
    )
  } catch (error) {
    Logger.error(error)
  }
}

main()
