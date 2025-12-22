import { Router } from 'express'

import BuilderRouter from '@src/api/Builders/builders.router'
import HealthRouter from '@src/api/Health/health.router'
import UsersRouter from '@src/api/Users/users.router'

import AuthRouter from '@Api/Auth/auth.router'

const router = Router()
  .use('/auth', AuthRouter)
  .use('/users', UsersRouter)
  .use('/builders', BuilderRouter)
  .use('/health', HealthRouter)

export const routerV1 = router
