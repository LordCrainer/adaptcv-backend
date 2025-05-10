import { Router } from 'express'

import UsersRouter from '@src/api/Users/users.router'

import AuthRouter from '@Api/Auth/auth.router'

import swaggerRouterV1 from './swaggerConfig'

const router = Router()
  .use('/', swaggerRouterV1)
  .use('/auth', AuthRouter)
  .use('/users', UsersRouter)

export const routerV1 = router
