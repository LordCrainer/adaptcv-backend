import { AuthMiddleware } from '@src/middleware/auth.middleware'
import { UserRepositoryMongo } from '@Api/Users/repository/users.repository.mongo'
import { RegistrationService } from '@src/services/registration/registration.service'
import { userService } from '../Users/users.dependencies'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

const userRepository = new UserRepositoryMongo()

export const authService = new AuthService(userRepository)
export const registrationService = new RegistrationService(userRepository)

export const inyectAuthController = new AuthController(authService, registrationService)

export const inyectAuthMiddleware = AuthMiddleware(userService, authService)
