
import Logger from '@src/lib/logger'
import type { EmailData, IEmailProvider } from './interfaces/email-provider.interface'

export interface SentEmail extends EmailData {
  sentAt: Date
}

export class MockEmailService implements IEmailProvider {
  private sentEmails: SentEmail[] = []

  /**
   * Simulates sending an email by storing it in memory
   * @param emailData - Email data to send
   * @returns Promise<boolean> - Always returns true for testing
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const sentEmail: SentEmail = {
        ...emailData,
        sentAt: new Date()
      }

      this.sentEmails.push(sentEmail)

      Logger.info(`[MOCK] Email sent to: ${emailData.to}`, {
        subject: emailData.subject,
        to: emailData.to
      })

      return true
    } catch (error) {
      Logger.error('[MOCK] Failed to send email', error)
      return false
    }
  }

  /**
   * Get all sent emails (for testing purposes)
   * @returns Array of sent emails
   */
  getSentEmails(): SentEmail[] {
    return [...this.sentEmails]
  }

  /**
   * Get emails sent to a specific address
   * @param email - Email address to filter by
   * @returns Array of emails sent to the specified address
   */
  getEmailsSentTo(email: string): SentEmail[] {
    return this.sentEmails.filter((sentEmail) => sentEmail.to === email)
  }

  /**
   * Clear all sent emails (useful for test cleanup)
   */
  clearSentEmails(): void {
    this.sentEmails = []
  }

  /**
   * Get the last sent email
   * @returns The most recently sent email, or undefined if none
   */
  getLastSentEmail(): SentEmail | undefined {
    return this.sentEmails[this.sentEmails.length - 1]
  }

  /**
   * Check if an email was sent to a specific address with a specific subject
   * @param to - Email address
   * @param subject - Email subject
   * @returns Boolean indicating if such an email was sent
   */
  wasEmailSent(to: string, subject: string): boolean {
    return this.sentEmails.some(
      (email) => email.to === to && email.subject === subject
    )
  }
}
