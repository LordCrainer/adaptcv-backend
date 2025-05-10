import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vitest
} from 'vitest'

import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { RequestExtended } from '@src/global'
import type { Response } from 'express'

import {
  authService,
  inyectAuthMiddleware
} from '@src/api/Auth/auth.dependencies'
import { UserRepositoryMongo } from '@src/api/Users/repository/users.repository.mongo'
import { userService } from '@src/api/Users/users.dependencies'
import {
  clearDatabase,
  connectToMemoryDB,
  disconnectFromMemoryDB
} from '@src/config/db/mongodb-memory-server'
import { shortId } from '@src/lib/shortId'

const userRepository = new UserRepositoryMongo()

describe('AuthMiddleware', () => {
  const user = {
    _id: 'test+AuthMiddleware',
    email: 'test+AuthMiddleware@example.com',
    password: 'password123',
    name: 'Test User'
  } as IUsers

  beforeAll(async () => {
    await connectToMemoryDB('lntv-user-test')
  })

  beforeEach(async () => {
    await clearDatabase()
    await userRepository.create(user)
  })

  afterAll(async () => {
    await disconnectFromMemoryDB()
  })

  it('should authenticate a user', async () => {
    const { data } = await authService.login(user)

    const req = {
      headers: {
        authorization: data?.token
      }
    } as RequestExtended
    const res = {} as Response
    const next = vitest.fn()
    await inyectAuthMiddleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should not authenticate a user with invalid token', async () => {
    const req = {
      headers: {
        authorization: 'invalid-token'
      }
    } as RequestExtended
    const res = {} as Response
    const next = vitest.fn()
    try {
      await inyectAuthMiddleware(req, res, next)
      expect(next).toHaveBeenCalled()
    } catch (e) {
      // expect(next).toHaveBeenCalledWith(expect.any(Error))
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Invalid token')
    }
  })
})
