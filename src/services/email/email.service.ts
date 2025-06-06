import nodemailer from 'nodemailer'

import type { SendMailOptions } from 'nodemailer'

import config from '@src/config/environments'
import Logger from '@src/lib/logger'
import { customError } from '@src/Shared/utils/errorUtils'
import type { EmailData, IEmailProvider } from './interfaces/email-provider.interface'

export class EmailService implements IEmailProvider {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email?.smtp?.host || 'smtp.gmail.com',
      port: config.email?.smtp?.port || 587,
      secure: config.email?.smtp?.secure || false,
      auth: {
        user: config.email?.smtp?.user,
        pass: config.email?.smtp?.password
      }
    })
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions: SendMailOptions = {
        from: config.email?.from || config.email?.smtp?.user,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      }

      const result = await this.transporter.sendMail(mailOptions)

      Logger.info(`Email sent successfully to ${emailData.to}`, {
        messageId: result.messageId
      })

      return true
    } catch (error) {
      Logger.error('Failed to send email', error)
      throw customError('internalServerError', 'Failed to send email')
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      Logger.info('Email service connection verified')
      return true
    } catch (error) {
      Logger.error('Email service connection failed', error)
      return false
    }
  }
}
