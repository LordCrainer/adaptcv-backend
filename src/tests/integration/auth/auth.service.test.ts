import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { IUsers } from '@lordcrainer/adaptcv-shared-types'

import { authService } from '@src/api/Auth/auth.dependencies'
import { dbStrategy } from '@src/config/db/dbStrategy'

import { UserRepositoryMongo } from '@Api/Users/repository/users.repository.mongo'

const selectedDb = dbStrategy.mongoMemory
const userRepository = new UserRepositoryMongo()

describe('AuthService', () => {
  beforeAll(async () => {
    await selectedDb.connect('acv-user-test')
    await selectedDb.clear()
  })

  afterAll(async () => {
    await selectedDb.disconnect()
  })

  it('should login a user', async () => {
    const user = {
      _id: 'test+loging',
      email: 'test+loging@example.com',
      password: 'password123',
      name: 'Test User'
    } as IUsers
    await userRepository.create(user)
    const auth = await authService.login({
      email: user.email,
      password: user.password as string
    })
    expect(auth?.user?.email).toBe(user.email)
    expect(auth?.token).toBeDefined()
  })

  it('should not login a user with invalid credentials', async () => {
    try {
      const user = {
        _id: 'test+token',
        email: 'test+token@example.com',
        password: 'password123',
        name: 'Test User'
      } as IUsers
      const expireSeconds = 1000

      const tokenData = await authService.generateToken(user, {
        expireSeconds
      })
      const payload = await authService.verifyToken(tokenData.token)
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

  it('should verify a valid token (decoded)', async () => {
    const user = {
      _id: 'test+token',
      email: 'test+token@example.com',
      password: 'password123',
      name: 'Test User'
    } as IUsers
    const expireSeconds = 1

    const tokenData = await authService.generateToken(user, {
      expireSeconds
    })
    const payload = await authService.decodeToken(tokenData.token)

    if (!payload?.exp || !payload?.iat) {
      throw new Error('Token not decoded')
    }

    const rangeTime = payload.exp - payload.iat
    expect(payload?._id).toBe(user._id)
    expect(rangeTime).toBe(expireSeconds)
  })

  it('should fail to verify an expired token', async () => {
    try {
      const user = {
        _id: 'test+expired',
        email: 'test+expired@example.com',
        password: 'password123',
        name: 'Test User'
      } as IUsers
      const expireSeconds = 1
      const tokenData = await authService.generateToken(user, { expireSeconds })

      await new Promise((res) => setTimeout(res, 1100))
      await expect(
        authService.verifyToken(tokenData.token)
      ).rejects.toHaveProperty('statusCode', 401)
    } catch (error) {
      expect(error).toHaveProperty('statusCode', 401)
      expect(error).toHaveProperty('name', 'invalidToken')
      expect(error).toBeInstanceOf(Error)
    }
  })
})
