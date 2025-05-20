import express from 'express'

import env from '@src/config/environments'
import currentEnv from '@src/config/environments'
import { expressMiddleware } from '@src/config/server/express.middleware'
import { errorHandler } from '@src/middleware/error.handler.http'
import swaggerRouter from '@src/routes/swaggerConfig'
import { routerV1 } from '@src/routes/v1/index'
import { customError } from '@src/Shared/utils/errorUtils'

const app: express.Application = express()
app.set('port', env.server.port)
app.set('secret', env.secret)
app.set('trust proxy', env.configGeneral?.trustProxy)

expressMiddleware(app)
app.use('/docs', swaggerRouter)

app.get('/', (req, res, next) => {
  if (currentEnv.environment === 'production') {
    next(customError('notFound', 'Not Found Route'))
  } else {
    res.redirect('/docs')
  }
})

app.use('/v1', routerV1)

app.use((req, res, next) => {
  next(
    customError('notFound', `Not Found Route: ${req.method} ${req.originalUrl}`)
  )
})

app.use(errorHandler)

export default app
