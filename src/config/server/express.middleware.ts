import compress from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import methodOverride from 'method-override'

import currentEnv from '../environments'
import morganConfigure from './morgan.config'

const env = currentEnv.environment

const expressMiddleware = (app: express.Application) => {
  if (env === 'production') {
    app.use(
      rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 100,
        message:
          'Too many requests from this IP, please try again after 5 minutes'
      })
    )
  }

  app.use(cookieParser(currentEnv.cookieSecret))

  app.use(compress())
  app.use(methodOverride())
  app.use(morganConfigure)
  app.use(
    express.urlencoded({
      extended: false
    })
  )
  app.use(express.json())
  app.use(helmet())
  app.use(
    cors({
      origin: currentEnv.cors.origin,
      credentials: true,
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    })
  )
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
  })

  return app
}

export { expressMiddleware }
