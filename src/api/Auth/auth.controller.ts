import ApiResponse from '@Shared/utils/apiResponse'

import { AuthService } from './auth.service'
import { AUTH_MESSAGES } from './constants/auth.messages'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login: IController = async (req, res, next) => {
    try {
      const { refreshToken, ...rest } = await this.authService.login(req.body)

      new ApiResponse(res)
        .setName('success')
        .setCookie('refreshToken', refreshToken)
        .json({
          data: rest,
          message: AUTH_MESSAGES.login
        })
    } catch (error) {
      next(error)
    }
  }

  logout: IController = async (req, res, next) => {
    try {
      const args = {
        userId: req.body.userId
      }
      const isLogout = await this.authService.logOut(args)
      new ApiResponse(res).setName('success').clearCookie('refreshToken').json({
        message: AUTH_MESSAGES.logout,
        data: isLogout
      })
    } catch (error) {
      next(error)
    }
  }

  signup: IController = async (req, res, next) => {
    try {
      const user = await this.authService.signUp(req.body)
      new ApiResponse(res).setName('success').json({
        message: AUTH_MESSAGES.sing_up,
        data: user
      })
    } catch (error) {
      next(error)
    }
  }

  isAuthenticated: IController = async (req, res, next) => {
    try {
      const user = await this.authService.isAuthenticated(req.body)
      new ApiResponse(res).setName('success').json({
        message: AUTH_MESSAGES.login,
        data: user
      })
    } catch (error) {
      next(error)
    }
  }

  refreshToken: IController = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken
      const tokens = await this.authService.refreshToken(refreshToken)
      new ApiResponse(res)
        .setName('success')
        .setCookie('refreshToken', tokens.refreshToken)
        .json({
          data: tokens,
          message: AUTH_MESSAGES.refresh_token
        })
    } catch (error) {
      next(error)
    }
  }
}
