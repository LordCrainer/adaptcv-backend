import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the config module before importing anything else
const mockConfig = vi.hoisted(() => ({
  environment: 'test'
}))

vi.mock('@src/config/environments', () => ({
  default: mockConfig
}))

import { EmailProviderFactory } from '@src/services/email/email-provider.factory'
import { EmailService } from '@src/services/email/email.service'
import { MockEmailService } from '@src/services/email/mock-email.service'

/**
 * @deprecated EmailProviderFactory is deprecated in favor of dependency injection pattern.
 * Use email.dependencies.ts for new implementations.
 * This test is maintained for backward compatibility.
 */
describe('EmailProviderFactory (Legacy)', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    EmailProviderFactory.resetInstance()
    
    // Clear any environment variable overrides
    delete process.env.NODE_ENV
    
    // Reset mock config to default test environment
    mockConfig.environment = 'test'
  })

  describe('create', () => {
    it('should create MockEmailService for test environment', () => {
      mockConfig.environment = 'test'
      const provider = EmailProviderFactory.create()
      expect(provider).toBeInstanceOf(MockEmailService)
    })

    it('should create EmailService for production environment', () => {
      mockConfig.environment = 'production'
      const provider = EmailProviderFactory.create()
      expect(provider).toBeInstanceOf(EmailService)
    })

    it('should create EmailService for development environment', () => {
      mockConfig.environment = 'development'
      const provider = EmailProviderFactory.create()
      expect(provider).toBeInstanceOf(EmailService)
    })

    it('should fall back to NODE_ENV when config.environment is not set', () => {
      mockConfig.environment = ''
      process.env.NODE_ENV = 'test'
      
      const provider = EmailProviderFactory.create()
      expect(provider).toBeInstanceOf(MockEmailService)
    })

    it('should default to development when no environment is set', () => {
      mockConfig.environment = ''
      delete process.env.NODE_ENV
      
      const provider = EmailProviderFactory.create()
      expect(provider).toBeInstanceOf(EmailService)
    })
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = EmailProviderFactory.getInstance()
      const instance2 = EmailProviderFactory.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('should create instance on first call', () => {
      const instance = EmailProviderFactory.getInstance()
      expect(instance).toBeDefined()
      expect(instance).toBeInstanceOf(MockEmailService) // Default for test env
    })
  })

  describe('resetInstance', () => {
    it('should reset singleton instance', () => {
      const instance1 = EmailProviderFactory.getInstance()
      EmailProviderFactory.resetInstance()
      const instance2 = EmailProviderFactory.getInstance()
      
      expect(instance1).not.toBe(instance2)
    })
  })

  describe('setProvider', () => {
    it('should allow setting custom provider', () => {
      const customProvider = new MockEmailService()
      EmailProviderFactory.setProvider(customProvider)
      
      const instance = EmailProviderFactory.getInstance()
      expect(instance).toBe(customProvider)
    })

    it('should override default provider creation', () => {
      const customProvider = new MockEmailService()
      EmailProviderFactory.setProvider(customProvider)
      
      // Even after reset, getInstance should create new instance
      EmailProviderFactory.resetInstance()
      const newInstance = EmailProviderFactory.getInstance()
      expect(newInstance).not.toBe(customProvider)
      expect(newInstance).toBeInstanceOf(MockEmailService)
    })
  })

  describe('MockEmailService functionality', () => {
    it('should provide mock functionality in test environment', async () => {
      const provider = EmailProviderFactory.create() as MockEmailService
      
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content'
      }

      const result = await provider.sendEmail(emailData)
      expect(result).toBe(true)

      const sentEmails = provider.getSentEmails()
      expect(sentEmails).toHaveLength(1)
      expect(sentEmails[0].to).toBe('test@example.com')
      expect(sentEmails[0].subject).toBe('Test Email')
    })
  })

  describe('Migration Notice', () => {
    it('should note that dependency injection is the preferred pattern', () => {
      // This test serves as documentation for the migration
      expect(true).toBe(true) // Always passes
      
      // Note: For new code, prefer using email.dependencies.ts:
      // import { emailProvider } from '@src/services/email/email.dependencies'
      // 
      // This provides the same functionality but with better testability
      // and follows modern dependency injection patterns.
    })
  })
})
