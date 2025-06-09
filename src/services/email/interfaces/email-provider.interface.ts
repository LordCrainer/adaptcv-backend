
export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export interface IEmailProvider {
  sendEmail(emailData: EmailData): Promise<boolean>
}
