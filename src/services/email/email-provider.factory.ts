
import config from '@src/config/environments'
import { EmailService } from './email.service'
import type { IEmailProvider } from './interfaces/email-provider.interface'
import { MockEmailService } from './mock-email.service'

export class EmailProviderFactory {
  private static instance: IEmailProvider | null = null

  /**
   * Creates and returns the appropriate email provider based on environment
   * @returns IEmailProvider - Real EmailService for production/development, MockEmailService for testing
   */
  static create(): IEmailProvider {
    const environment = config.environment || process.env.NODE_ENV || 'development'

    // Use mock email service for testing
    if (environment === 'test' || !config.email?.smtp) {
      return new MockEmailService()
    }

    // Use real email service for production and development
    return new EmailService()
  }

  /**
   * Gets a singleton instance of the email provider
   * Useful for testing when you need to access the same mock instance
   * @returns IEmailProvider - Singleton instance
   */
  static getInstance(): IEmailProvider {
    if (!this.instance) {
      this.instance = this.create()
    }
    return this.instance
  }

  /**
   * Resets the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null
  }

  /**
   * Forces the use of a specific provider (useful for testing)
   * @param provider - The email provider to use
   */
  static setProvider(provider: IEmailProvider): void {
    this.instance = provider
  }
}
