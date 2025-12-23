import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'

import app from '@src/config/server'
import { dbStrategy } from '@src/config/db/dbStrategy'
import currentEnv from '@src/config/environments'

const selectedDb = dbStrategy.mongoMemory

describe('Registration E2E Tests', () => {
  beforeAll(async () => {
    await selectedDb.connect('acv-registration-test')
  })

  afterAll(async () => {
    await selectedDb.disconnect()
  })

  beforeEach(async () => {
    await selectedDb.clear()
  })

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data.email).toBe(userData.email)
      expect(response.body.data.name).toBe(userData.name)
      expect(response.body.data.status).toBe('pending')
      expect(response.body.message).toMatch(/Registration successful/i)
    })

    it('should fail with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)

      expect(response.status).toBe(400)
    })

    it('should fail with short password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      }

      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)

      expect(response.status).toBe(400)
    })

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      // Primer registro
      await request(app)
        .post('/v1/auth/register')
        .send(userData)

      // Segundo registro con mismo email
      const response = await request(app)
        .post('/v1/auth/register')
        .send(userData)

      expect(response.status).toBe(409)
      expect(response.body.message).toContain('already registered')
    })
  })

  describe('POST /auth/resend-verification', () => {
    it('should resend verification email for pending user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      // Registrar usuario
      await request(app)
        .post('/v1/auth/register')
        .send(userData)

      // Reenviar verificación
      const response = await request(app)
        .post('/v1/auth/resend-verification')
        .send({ email: userData.email })

      expect(response.status).toBe(200)
      expect(response.body.data.sent).toBe(true)
    })

    it('should fail for non-existent user', async () => {
      const response = await request(app)
        .post('/v1/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /auth/verify-email', () => {
    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/v1/auth/verify-email?token=invalid-token')

      expect(response.status).toBe(400)
      expect(response.body.data.verified).toBe(false)
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/v1/auth/verify-email')

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('token is required')
    })
  })
})
