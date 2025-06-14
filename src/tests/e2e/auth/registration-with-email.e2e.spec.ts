import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { MockEmailService } from '@src/services/email/mock-email.service'

import { redisConnection } from '@src/config/cache/redis'
import { dbStrategy } from '@src/config/db/dbStrategy'
import currentEnv from '@src/config/environments'
import app from '@src/config/server'
import { emailProvider } from '@src/services/email/email.dependencies'

const selectedDb = dbStrategy.mongoMemory

// Get the mock email service instance for testing
let mockEmailService: MockEmailService

describe('Registration with Email E2E Tests', () => {
  beforeAll(async () => {
    await selectedDb.connect('acv-registration-email-test')
    await redisConnection(currentEnv.dataBase.redis.uri)

    // Get the mock email service instance - it should be MockEmailService in test environment
    mockEmailService = emailProvider as MockEmailService
  })

  afterAll(async () => {
    await selectedDb.disconnect()
  })

  beforeEach(async () => {
    await selectedDb.clear()
    // Clear sent emails before each test
    mockEmailService.clearSentEmails()
  })

  describe('POST /auth/register - Email Verification Flow', () => {
    it('should register a new user and send verification email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)

      // Check API response
      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data.email).toBe(userData.email)
      expect(response.body.data.name).toBe(userData.name)
      expect(response.body.data.status).toBe('pending')
      expect(response.body.message).toContain('Registration successful')

      // Check that verification email was sent
      const sentEmails = await mockEmailService.getSentEmails()
      expect(sentEmails).toHaveLength(1)

      const verificationEmail = sentEmails[0]
      expect(verificationEmail.to).toBe(userData.email)
      expect(verificationEmail.subject).toBe('Verifica tu cuenta - AdaptCV')
      expect(verificationEmail.html).toContain(userData.name)
      expect(verificationEmail.html).toMatch(/Verifica tu cuenta/ig)
    })

    it('should register user and verification email should contain valid verification URL', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepass123'
      }

      await request(app).post('/v1/auth/register').send(userData)

      const sentEmails = mockEmailService.getSentEmails()
      const verificationEmail = sentEmails[0]

      // Extract verification URL from email HTML
      const urlMatch = verificationEmail.html.match(
        /href="([^"]*verify-email[^"]*)"/
      )
      expect(urlMatch).toBeTruthy()

      if (urlMatch) {
        const verificationUrl = urlMatch[1]
        expect(verificationUrl).toContain('verify-email')
        expect(verificationUrl).toMatch(/token&#x3D;/ig)
      }
    })
  })

  describe('POST /auth/resend-verification - Email Flow', () => {
    it('should resend verification email for pending user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      // Register user first
      await request(app).post('/v1/auth/register').send(userData)

      // Clear sent emails to test resend
      mockEmailService.clearSentEmails()

      // Resend verification
      const response = await request(app)
        .post('/v1/auth/resend-verification')
        .send({ email: userData.email })

      // Check API response
      expect(response.status).toBe(200)
      expect(response.body.data.sent).toBe(true)

      // Check that new verification email was sent
      const sentEmails = mockEmailService.getSentEmails()
      expect(sentEmails).toHaveLength(1)

      const verificationEmail = sentEmails[0]
      expect(verificationEmail.to).toBe(userData.email)
      expect(verificationEmail.subject).toBe('Verifica tu cuenta - AdaptCV')
    })

    it('should track multiple email sends correctly', async () => {
      const userData1 = {
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123'
      }

      const userData2 = {
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123'
      }

      // Register two users
      await request(app).post('/v1/auth/register').send(userData1)

      await request(app).post('/v1/auth/register').send(userData2)

      // Check total emails sent
      const sentEmails = mockEmailService.getSentEmails()
      expect(sentEmails).toHaveLength(2)

      // Check emails sent to specific users
      const user1Emails = mockEmailService.getEmailsSentTo(userData1.email)
      const user2Emails = mockEmailService.getEmailsSentTo(userData2.email)

      expect(user1Emails).toHaveLength(1)
      expect(user2Emails).toHaveLength(1)

      expect(user1Emails[0].html).toContain(userData1.name)
      expect(user2Emails[0].html).toContain(userData2.name)
    })
  })

  describe('Email Service Mock Functionality', () => {
    it('should provide access to mock email service methods', async () => {
      const userData = {
        name: 'Mock Test User',
        email: 'mocktest@example.com',
        password: 'password123'
      }

      await request(app).post('/v1/auth/register').send(userData)

      // Test mock service functionality
      expect(mockEmailService.getSentEmails()).toHaveLength(1)
      expect(mockEmailService.getLastSentEmail()?.to).toBe(userData.email)
      expect(
        mockEmailService.wasEmailSent(
          userData.email,
          'Verifica tu cuenta - AdaptCV'
        )
      ).toBe(true)
      expect(
        mockEmailService.wasEmailSent(userData.email, 'Different Subject')
      ).toBe(false)

      // Test clearing emails
      mockEmailService.clearSentEmails()
      expect(mockEmailService.getSentEmails()).toHaveLength(0)
    })
  })

  describe('Error Handling with Email Service', () => {
    it('should handle registration even if email details are checked', async () => {
      const userData = {
        name: 'Test User',
        email: 'error-test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)

      // Registration should still succeed
      expect(response.status).toBe(201)
      expect(response.body.data.status).toBe('pending')

      // Email should still be sent (mock always succeeds)
      const sentEmails = mockEmailService.getSentEmails()
      expect(sentEmails).toHaveLength(1)
    })
  })
})
