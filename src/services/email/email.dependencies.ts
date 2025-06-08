import config from '@src/config/environments'
import { EmailService } from './email.service'
import type { IEmailProvider } from './interfaces/email-provider.interface'
import { MockEmailService } from './mock-email.service'

/**
 * Creates the appropriate email provider based on environment
 */
const createEmailProvider = (): IEmailProvider => {
  const environment = config.environment || process.env.NODE_ENV || 'development'
  
  if (environment === 'test') {
    return new MockEmailService()
  }
  
  return new EmailService()
}

export const emailProvider = createEmailProvider()
