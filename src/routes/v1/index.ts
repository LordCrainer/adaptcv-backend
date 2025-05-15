import { Router } from 'express'

import BuilderRouter from '@src/api/Builder/builder.router'
import UsersRouter from '@src/api/Users/users.router'

import AuthRouter from '@Api/Auth/auth.router'

const router = Router()
  .use('/auth', AuthRouter)
  .use('/users', UsersRouter)
  .use('/builders', BuilderRouter)

export const routerV1 = router
