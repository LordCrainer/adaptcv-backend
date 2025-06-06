import type { RegistrationService } from '@src/services/registration/registration.service'

import ApiResponse from '@Shared/utils/apiResponse'

import { AuthService } from './auth.service'
import { AUTH_MESSAGES } from './constants/auth.messages'

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registrationService: RegistrationService
  ) {}

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

  // Métodos de registro
  register: IController = async (req, res, next) => {
    try {
      const { name, email, password } = req.body
      const result = await this.registrationService.registerUser({
        name,
        email,
        password
      })

      new ApiResponse(res).setName('created').json({
        data: result.user,
        message: result.message
      })
    } catch (error) {
      next(error)
    }
  }

  verifyEmail: IController = async (req, res, next) => {
    try {
      const token = req.query?.token as string

      if (!token) {
        return new ApiResponse(res).setName('badRequest').json({
          data: null,
          message: 'Verification token is required'
        })
      }

      const result = await this.registrationService.verifyEmail(token)

      const statusName = result.success ? 'success' : 'badRequest'
      new ApiResponse(res).setName(statusName).json({
        data: { verified: result.success },
        message: result.message
      })
    } catch (error) {
      next(error)
    }
  }

  resendVerification: IController = async (req, res, next) => {
    try {
      const { email } = req.body

      if (!email) {
        return new ApiResponse(res).setName('badRequest').json({
          data: null,
          message: 'Email is required'
        })
      }

      const result =
        await this.registrationService.resendVerificationEmail(email)

      const statusName = result.success ? 'success' : 'badRequest'
      new ApiResponse(res).setName(statusName).json({
        data: { sent: result.success },
        message: result.message
      })
    } catch (error) {
      next(error)
    }
  }
}
