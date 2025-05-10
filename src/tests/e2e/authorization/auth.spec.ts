import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import app from '@src/config/server'
import { usersSeederInput } from '@src/tests/seeders/users.seeder'

import { getAuthToken } from '../helpers/auth.context'

describe('Auth End-to-End Tests', () => {
  const signupEndpoint = '/v1/signup'
  const loginEndpoint = '/v1/auth/login'
  let tokenSuperAdmin: string
  let tokenAdmin: string

  beforeAll(async () => {
    try {
      tokenSuperAdmin = await getAuthToken('superAdmin')
      expect(tokenSuperAdmin).toBeDefined()
    } catch (error: any) {
      console.error('Failed to get token for superAdmin', error.message)
      throw new Error(error)
    }

    try {
      tokenAdmin = await getAuthToken('admin')
      expect(tokenAdmin).toBeDefined()
    } catch (error: any) {
      console.error('Failed to get token for admin', error.message)
      throw new Error(error)
    }
  })

  describe('CRUD Operations by superAdmin', () => {
    it('Should be able to log in with superAdmin credentials ', async () => {
      const response = await request(app)
        .post(loginEndpoint)
        .send(usersSeederInput.superAdmin)

      tokenSuperAdmin = response.body.token

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('token')
    })

    it('should fail to log in with incorrect credentials', async () => {
      const response = await request(app).post(loginEndpoint).send({
        username: 'testuser',
        email: 'testuser@fail.com',
        password: 'wrongpassword'
      })

      expect(response.body).toHaveProperty('message', 'Invalid credentials')
      expect(response.status).toBe(401)
    })
  })

  describe('CRUD Operations by Admin', () => {
    it('Should be able to log in with admin credentials ', async () => {
      const response = await request(app)
        .post(loginEndpoint)
        .send(usersSeederInput.admin)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('token')
    })
  })
})
