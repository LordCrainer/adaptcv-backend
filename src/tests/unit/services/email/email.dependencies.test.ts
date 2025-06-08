import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EmailService } from '@src/services/email/email.service'
import { MockEmailService } from '@src/services/email/mock-email.service'

// Mock the config module
const mockConfig = vi.hoisted(() => ({
  environment: 'test'
}))

vi.mock('@src/config/environments', () => ({
  default: mockConfig
}))

describe('Email Dependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module cache to get fresh imports
    vi.resetModules()
  })

  describe('emailProvider creation', () => {
    it('should create MockEmailService for test environment', async () => {
      mockConfig.environment = 'test'

      // Re-import the module after changing the config
      const { emailProvider } = await import(
        '@src/services/email/email.dependencies'
      )

      expect(emailProvider.constructor.name).toBe('MockEmailService')
    })

    it('should create EmailService for production environment', async () => {
      mockConfig.environment = 'production'

      // Re-import the module after changing the config
      const { emailProvider } = await import(
        '@src/services/email/email.dependencies'
      )

      expect(emailProvider.constructor.name).toBe('EmailService')
    })

    it('should create EmailService for development environment', async () => {
      mockConfig.environment = 'development'

      // Re-import the module after changing the config
      const { emailProvider } = await import(
        '@src/services/email/email.dependencies'
      )

      expect(emailProvider.constructor.name).toBe('EmailService')
    })

    it('should fall back to NODE_ENV when config.environment is not set', async () => {
      mockConfig.environment = ''
      process.env.NODE_ENV = 'test'

      // Re-import the module after changing the config
      const { emailProvider } = await import(
        '@src/services/email/email.dependencies'
      )

      expect(emailProvider.constructor.name).toBe('MockEmailService')

      // Clean up
      delete process.env.NODE_ENV
    })

    it('should default to EmailService when no environment is set', async () => {
      mockConfig.environment = ''
      delete process.env.NODE_ENV

      // Re-import the module after changing the config
      const { emailProvider } = await import(
        '@src/services/email/email.dependencies'
      )

      expect(emailProvider.constructor.name).toBe('EmailService')
    })
  })

  describe('MockEmailService functionality', () => {
    it('should provide mock functionality in test environment', async () => {
      mockConfig.environment = 'test'

      // Re-import the module after changing the config
      const { emailProvider } = await import(
        '@src/services/email/email.dependencies'
      )

      const mockProvider = emailProvider as MockEmailService

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content'
      }

      const result = await mockProvider.sendEmail(emailData)
      expect(result).toBe(true)

      const sentEmails = mockProvider.getSentEmails()
      expect(sentEmails).toHaveLength(1)
      expect(sentEmails[0].to).toBe('test@example.com')
      expect(sentEmails[0].subject).toBe('Test Email')
    })
  })
})
