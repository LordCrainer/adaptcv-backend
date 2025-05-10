import { UserRepositoryMongo } from '@Api/Users/repository/users.repository.mongo'

import { UsersController } from './users.controller'
import { UserService } from './users.service'

export const userRepositoryMongo = new UserRepositoryMongo()
export const userService = new UserService(userRepositoryMongo)
export const inyectUserController = new UsersController(userService)
