import type { UserRepository } from '@Api/Users/interfaces/users.repository'
import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { IEmailProvider } from '@src/services/email/interfaces/email-provider.interface'

import { AUTH_MESSAGES } from '@src/api/Auth/constants/auth.messages'
import { USER_MESSAGES } from '@src/api/Users/constants/users.message'
import Logger from '@src/lib/logger'
import { shortId } from '@src/lib/shortId'
import { TemplateService } from '@src/services/email/template.service'
import type { VerificationService } from '@src/services/verification/verification.service'
import { customError } from '@src/Shared/utils/errorUtils'

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface RegisterResult {
  user: Partial<IUsers>
  message: string
}

export class RegistrationService {
  private readonly userRepository: UserRepository
  private readonly emailProvider: IEmailProvider
  private readonly templateService: TemplateService
  private readonly verificationService: VerificationService

  constructor(
    userRepository: UserRepository,
    verificationService: VerificationService,
    emailProvider: IEmailProvider
  ) {
    this.userRepository = userRepository
    this.emailProvider = emailProvider
    this.templateService = new TemplateService()
    this.verificationService = verificationService
  }

  /**
   * Registra un nuevo usuario y envía email de verificación
   */
  async registerUser(registerData: RegisterData): Promise<RegisterResult> {
    try {
      // 1. Validar datos de entrada
      this.validateRegisterData(registerData)

      // 2. Verificar que el email no esté registrado
      await this.checkEmailAvailability(registerData.email)

      // 3. Crear usuario con estado pending
      const newUser = await this.createPendingUser(registerData)

      // 4. Generar token de verificación
      const verificationToken =
        this.verificationService.generateVerificationToken(newUser)
      const verificationUrl =
        this.verificationService.generateVerificationUrl(verificationToken)

      // 5. Enviar email de verificación
      await this.sendVerificationEmail(newUser, verificationUrl)

      Logger.info(`User registered successfully: ${newUser.email}`)

      return {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          status: newUser.status
        },
        message: AUTH_MESSAGES.registration_success
      }
    } catch (error) {
      Logger.error('Registration failed', error)
      throw error
    }
  }

  /**
   * Verifica el email de un usuario
   */
  async verifyEmail(
    token: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // 1. Verificar el token
      const verificationResult =
        await this.verificationService.verifyToken(token)

      if (!verificationResult.success) {
        return {
          success: false,
          message: verificationResult.message
        }
      }

      // 2. Buscar el usuario
      const user = await this.userRepository.findOne({
        _id: verificationResult.userId
      })

      if (!user) {
        return {
          success: false,
          message: USER_MESSAGES.not_found
        }
      }

      // 3. Verificar si ya está verificado
      if (user.status === 'active') {
        return {
          success: true,
          message: AUTH_MESSAGES.email_already_verified
        }
      }

      // 4. Activar la cuenta
      await this.userRepository.update(
        { _id: user._id },
        { $set: { status: 'active' } }
      )

      Logger.info(`Email verified successfully: ${user.email}`)

      return {
        success: true,
        message: AUTH_MESSAGES.email_verified
      }
    } catch (error) {
      Logger.error('Email verification failed', error)
      return {
        success: false,
        message: AUTH_MESSAGES.verification_failed
      }
    }
  }

  /**
   * Reenvía el email de verificación
   */
  async resendVerificationEmail(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Buscar el usuario
      const user = await this.userRepository.findOne({ email })

      if (!user) {
        throw customError('notFound', USER_MESSAGES.not_found)
      }

      // 2. Verificar si ya está verificado
      if (user.status === 'active') {
        return {
          success: false,
          message: AUTH_MESSAGES.email_already_verified
        }
      }

      // 3. Verificar si ya hay un token pendiente
      const hasPendingToken = await this.verificationService.hasPendingToken(
        user._id
      )

      if (hasPendingToken) {
        // Invalidar el token anterior
        await this.verificationService.invalidateToken(user._id)
      }

      // 4. Generar nuevo token y enviar email
      const verificationToken =
        this.verificationService.generateVerificationToken(user)
      const verificationUrl =
        this.verificationService.generateVerificationUrl(verificationToken)

      await this.sendVerificationEmail(user, verificationUrl)

      Logger.info(`Verification email resent: ${user.email}`)

      return {
        success: true,
        message: AUTH_MESSAGES.verification_email_sent
      }
    } catch (error) {
      Logger.error('Failed to resend verification email', error)
      throw error
    }
  }

  /**
   * Valida los datos de registro
   */
  private validateRegisterData(data: RegisterData): void {
    if (!data.name || data.name.trim().length < 2) {
      throw customError(
        'validationParams',
        'Name must be at least 2 characters long'
      )
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw customError('validationParams', 'Valid email is required')
    }

    if (!data.password || data.password.length < 6) {
      throw customError(
        'validationParams',
        'Password must be at least 6 characters long'
      )
    }
  }

  /**
   * Verifica que el email no esté registrado
   */
  private async checkEmailAvailability(email: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({ email })

    if (existingUser) {
      throw customError('conflict', 'Email already registered')
    }
  }

  /**
   * Crea un usuario con estado pending
   */
  private async createPendingUser(registerData: RegisterData): Promise<IUsers> {
    const newUser: IUsers = {
      _id: shortId.rnd(),
      name: registerData.name.trim(),
      email: registerData.email.toLowerCase().trim(),
      password: registerData.password,
      status: 'pending',
      authProvider: 'local'
    }

    const savedUser = await this.userRepository.create(newUser)

    if (!savedUser) {
      throw customError('internalServerError', USER_MESSAGES.not_created)
    }

    return savedUser
  }

  /**
   * Envía el email de verificación
   */
  private async sendVerificationEmail(
    user: IUsers,
    verificationUrl: string
  ): Promise<void> {
    try {
      const templateData = {
        name: user.name,
        verificationUrl,
        expirationHours: 24,
        year: new Date().getFullYear()
      }

      const { html, text } = await this.templateService.renderTemplate(
        'verification-email',
        templateData
      )

      await this.emailProvider.sendEmail({
        to: user.email,
        subject: 'Verifica tu cuenta - AdaptCV',
        html,
        text
      })

      Logger.info(`Verification email sent to: ${user.email}`)
    } catch (error) {
      Logger.error('Failed to send verification email', error)
      throw customError(
        'internalServerError',
        'Failed to send verification email'
      )
    }
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
