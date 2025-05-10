import { Router } from 'express'

import UsersRouter from '@src/api/Users/users.router'

import AuthRouter from '@Api/Auth/auth.router'

import swaggerRouterV1 from './swaggerConfig'

const router = Router()
.use('/auth', AuthRouter)
.use('/users', UsersRouter)
.use('/', swaggerRouterV1) // Cambiar la ruta de Swagger a la raíz

export const routerV1 = router
