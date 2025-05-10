import ApiResponse from '@Shared/utils/apiResponse'

import { AuthService } from './auth.service'
import { AUTH_MESSAGES } from './constants/auth.messages'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login: IController = async (req, res, next) => {
    try {
      const user = await this.authService.login(req.body)
      return ApiResponse.success(res).json({ ...user })
    } catch (error) {
      next(error)
    }
  }

  logout: IController = async (req, res, next) => {
    try {
      const args = {
        userId: req.body.userId
      }
      await this.authService.logOut(args)
      return ApiResponse.success(res).json({
        message: AUTH_MESSAGES.logout
      })
    } catch (error) {
      next(error)
    }
  }

  signup: IController = async (req, res, next) => {
    try {
      const user = await this.authService.signUp(req.body)
      return ApiResponse.success(res).json({ ...user })
    } catch (error) {
      next(error)
    }
  }

  isAuthenticated: IController = async (req, res, next) => {
    try {
      const user = await this.authService.isAuthenticated(req.body)
      return ApiResponse.success(res).json({
        message: AUTH_MESSAGES.login,
        data: user
      })
    } catch (error) {
      next(error)
    }
  }
}
