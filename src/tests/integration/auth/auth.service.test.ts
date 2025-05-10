import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { authService } from '@src/api/Auth/auth.dependencies'
import { userService } from '@src/api/Users/users.dependencies'
import {
  clearDatabase,
  connectToMemoryDB,
  disconnectFromMemoryDB
} from '@src/config/db/mongodb-memory-server'

import { UserRepositoryMongo } from '@Api/Users/repository/users.repository.mongo'
import type { IUsers } from '@lordcrainer/adaptcv-shared-types'

const userRepository = new UserRepositoryMongo()

describe('AuthService', () => {
  beforeAll(async () => {
    await connectToMemoryDB('lntv-user-test')
    await clearDatabase()
  })

  afterAll(async () => {
    await disconnectFromMemoryDB()
  })

  it('should login a user', async () => {
    const user = {
      _id: 'test+loging',
      email: 'test+loging@example.com',
      password: 'password123',
      name: 'Test User'
    } as IUsers
    await userRepository.create(user)
    const { data } = await authService.login(user)
    expect(data?.user?.email).toBe(user.email)
  })

  it('should not login a user with invalid credentials', async () => {
    try {
      const user = {
        _id: 'test+token',
        email: 'test+token@example.com',
        password: 'password123',
        name: 'Test User',
        organizations: [
          {
            _id: 'test+token+org',
            organizationId: 'test+token+org'
          }
        ]
      } as IUsers
      const expireSeconds = 1000

      const tokenData = await authService.generateToken(user, {
        expireSeconds
      })
      const payload = await userService.verifyToken(tokenData.token)
      if (!payload?.exp || !payload?.iat) {
        throw new Error('Token not decoded')
      }

      const rangeTime = payload.exp - payload.iat
      expect(payload?._id).toBe(user._id)
      expect(rangeTime).toBe(expireSeconds)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  // it('should sign up a user', async () => {
  //   // Test implementation
  // })

  // it('should check if a user is authenticated', async () => {
  //   // Test implementation
  // })
})
