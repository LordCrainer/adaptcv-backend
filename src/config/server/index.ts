import express from 'express'

import env from '@src/config/environments'
import { expressMiddleware } from '@src/config/server/express.middleware'
import { errorHandler } from '@src/middleware/error.handler.http'
import { routerV1 } from '@src/routes/v1/index'

const app: express.Application = express()
app.set('port', env.server.port)
app.set('secret', env.secret)
app.set('trust proxy', env.configGeneral?.trustProxy)

expressMiddleware(app)
app.use('/v1', routerV1)

app.use(errorHandler)

export default app
