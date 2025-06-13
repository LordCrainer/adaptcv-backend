import type { UserRepository } from '@Api/Users/interfaces/users.repository'
import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { IEmailProvider } from '@src/services/email/interfaces/email-provider.interface'
import type { TemplateService } from '@src/services/email/template.service'
import type { VerificationService } from '@src/services/verification/verification.service'

import { AUTH_MESSAGES } from '@src/api/Auth/constants/auth.messages'
import { USER_MESSAGES } from '@src/api/Users/constants/users.message'
import Logger from '@src/lib/logger'
import { shortId } from '@src/lib/shortId'
import { customError } from '@src/Shared/utils/errorUtils'

export interface RegisterData {
  name: string
  email: string
  password: string
}

export class RegistrationService {
  private readonly userRepository: UserRepository
  private readonly emailProvider: IEmailProvider
  private readonly templateService: TemplateService
  private readonly verificationService: VerificationService

  constructor(
    userRepository: UserRepository,
    verificationService: VerificationService,
    emailProvider: IEmailProvider,
    templateService: TemplateService
  ) {
    this.userRepository = userRepository
    this.emailProvider = emailProvider
    this.templateService = templateService
    this.verificationService = verificationService
  }

  /**
   * Registers a new user and sends a verification email.
   * @param registerData - The data for the new user.
   * @returns The API response containing the user data or an error message.
   */
  async registerUser(
    registerData: RegisterData
  ): Promise<IApiResponse<Partial<IUsers>>> {
    try {
      this.validateRegisterData(registerData)

      await this.checkEmailAvailability(registerData.email)

      const newUser = await this.createPendingUser(registerData)

      const verificationToken =
        this.verificationService.generateVerificationToken(newUser)
      const verificationUrl =
        this.verificationService.generateVerificationUrl(verificationToken)

      await this.sendVerificationEmail(newUser, verificationUrl)

      Logger.info(`User registered successfully: ${newUser.email}`)

      return {
        data: {
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
   * Verifies the email using the provided token.
   * @param token - The verification token.
   * @returns The API response indicating success or failure.
   */
  async verifyEmail(token: string): Promise<IApiResponse<null>> {
    try {
      const verificationResult =
        await this.verificationService.verifyToken(token)

      if (!verificationResult.success) {
        return {
          success: false,
          data: null,
          message: verificationResult.message
        }
      }

      const user = await this.userRepository.findOne({
        _id: verificationResult.userId
      })

      if (!user) {
        return {
          success: false,
          data: null,
          message: USER_MESSAGES.not_found
        }
      }

      if (user.status === 'active') {
        return {
          success: true,
          data: null,
          message: AUTH_MESSAGES.email_already_verified
        }
      }

      await this.userRepository.update(
        { _id: user._id },
        { $set: { status: 'active' } }
      )

      Logger.info(`Email verified successfully: ${user.email}`)

      return {
        success: true,
        data: null,
        message: AUTH_MESSAGES.email_verified
      }
    } catch (error) {
      Logger.error('Email verification failed', error)
      return {
        success: false,
        data: null,
        message: AUTH_MESSAGES.verification_failed
      }
    }
  }

  /**
   * Resends the verification email.
   * @param email - The email address of the user.
   * @returns The API response indicating success or failure.
   */
  async resendVerificationEmail(email: string): Promise<IApiResponse<null>> {
    try {
      const user = await this.userRepository.findOne({ email })

      if (!user?._id) {
        throw customError('notFound', USER_MESSAGES.not_found)
      }

      if (user.status === 'active') {
        return {
          success: false,
          data: null,
          message: AUTH_MESSAGES.email_already_verified
        }
      }

      const hasPendingToken = await this.verificationService.hasPendingToken(
        user._id
      )

      if (hasPendingToken) {
        await this.verificationService.invalidateToken(user._id)
      }

      const verificationToken =
        this.verificationService.generateVerificationToken(user)
      const verificationUrl =
        this.verificationService.generateVerificationUrl(verificationToken)

      await this.sendVerificationEmail(user, verificationUrl)

      Logger.info(`Verification email resent: ${user.email}`)

      return {
        success: true,
        data: null,
        message: AUTH_MESSAGES.verification_email_sent
      }
    } catch (error) {
      Logger.error('Failed to resend verification email', error)
      throw error
    }
  }

  /**
   * Validates the registration data.
   * @param data - The registration data to validate.
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
   * Checks if the email is already registered.
   * @param email - The email to check.
   * @throws {Error} If the email is already registered.
   */
  private async checkEmailAvailability(email: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({ email })

    if (existingUser) {
      throw customError('conflict', 'Email already registered')
    }
  }

  /**
   * Creates a user with pending status.
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
   * Sends the verification email.
   * @param user - The user to send the email to.
   * @param verificationUrl - The URL for email verification.
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
   * Validates the email format.
   * @param email - The email to validate.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }
}
