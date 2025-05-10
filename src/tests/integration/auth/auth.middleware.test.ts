import { Organizations, TypeOrganization } from '@lanubetv/sed-share-types'
import { Response } from 'express'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vitest
} from 'vitest'

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
import { RequestExtended } from '@src/global'
import { shortId } from '@src/lib/shortId'

import { organizationsService } from '@Api/Organizations/organizations.dependencies'
import { IUsers } from '@Api/Users/interfaces/users.interface'

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

  it('should authorize a user', async () => {
    const organization = {
      _id: '_id+test+loging+org',
      name: 'Test Organization',
      contact: [
        { name: 'John Doe', type: 'contact', email: 'johndoe@test.com' }
      ],
      type: TypeOrganization.PERSONAL
    } as Organizations

    const otherOrganization = {
      _id: '_id+test+loging+org+other',
      name: 'Other Test Organization',
      contact: [
        { name: 'John Doe', type: 'contact', email: 'johndoe@test.com' }
      ],
      type: TypeOrganization.PERSONAL
    } as Organizations

    const { data: createdOrg } = await organizationsService.create({
      body: organization
    })
    const { data: createdOtherOrg } = await organizationsService.create({
      body: otherOrganization
    })

    await userRepository.update(
      {
        _id: user._id
      },
      {
        $set: {
          organizations: [
            {
              _id: shortId.rnd(),
              organizationId: createdOrg?._id
            },
            {
              _id: shortId.rnd(),
              organizationId: createdOtherOrg?._id
            }
          ]
        }
      }
    )

    const { data: foundUser } = await userService.getUser({
      userId: user._id,
      filters: {
        organizations: { $elemMatch: { organizationId: createdOrg?._id } }
      }
    })

    expect(foundUser?.organizations).toHaveLength(2)
    const currentOrgData = foundUser?.organizations?.find(
      (o) => o.organizationId === createdOrg?._id
    )
    expect(currentOrgData?.organizationId).toStrictEqual(createdOrg?._id)
  })
})
