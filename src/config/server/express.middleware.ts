import compress from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
// import cors from "cors";
import helmet from 'helmet'
import methodOverride from 'method-override'

import currentEnv from '../environments'
import morganConfigure from './morgan.config'

const expressMiddleware = (app: express.Application) => {
  if (currentEnv.environment === 'production') {
    app.use(
      rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 100,
        message:
          'Too many requests from this IP, please try again after 5 minutes'
      })
    )
  }

  app.use(compress())
  app.use(methodOverride())
  app.use(morganConfigure)
  // express middleware
  app.use(
    express.urlencoded({
      extended: false
    })
  )
  app.use(express.json())
  app.use(helmet())
  app.use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
      ]
    })
  )
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
  })

  return app
}

export { expressMiddleware }
