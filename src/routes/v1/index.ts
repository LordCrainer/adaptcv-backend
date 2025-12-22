import { Router } from 'express'

import BuilderRouter from '@src/api/Builders/builders.router'
import UsersRouter from '@src/api/Users/users.router'

import AuthRouter from '@Api/Auth/auth.router'
import TranslationRouter from '@src/api/Translation/translation.router'

const router = Router()
  .use('/auth', AuthRouter)
  .use('/users', UsersRouter)
  .use('/builders', BuilderRouter)
  .use('/translation', TranslationRouter)

export const routerV1 = router
