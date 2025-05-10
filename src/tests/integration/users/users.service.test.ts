import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { organizationsRepositoryMongo } from '@src/api/Organizations/organizations.dependencies'
import {
  checkPasswordHash,
  generatePasswordHash
} from '@src/api/Users/helpers/users.helpers'
import {
  clearDatabase,
  connectToMemoryDB,
  disconnectFromMemoryDB
} from '@src/config/db/mongodb-memory-server'

import { USER_MESSAGES } from '@Api/Users/constants/users.message'
import { UserCreationParams } from '@Api/Users/interfaces/users.interface'
import { UserRepositoryMongo } from '@Api/Users/repository/users.repository.mongo'
import { usersModel } from '@Api/Users/repository/users.schema'
import { UserService } from '@Api/Users/users.service'

let userService: UserService
let userRepository: UserRepositoryMongo

describe('UserService', () => {
  userRepository = new UserRepositoryMongo()
  userService = new UserService(userRepository, organizationsRepositoryMongo)

  beforeAll(async () => {
    await connectToMemoryDB('lntv-user-test')
    await clearDatabase()
  })

  afterAll(async () => {
    await disconnectFromMemoryDB()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('UserModel Methods', () => {
    it('should compare password', async () => {
      const user = new usersModel({
        _id: 'test+model',
        email: 'test+model@example.com',
        password: 'password123',
        name: 'Test User'
      })
      const newUser = await user.save()

      expect(!!newUser.password).toBe(false)
      expect(!!newUser.passwordHash).toBe(true)
      expect(newUser.passwordHash).not.toBe('password123')
    })

    it('should compare passwords correctly', async () => {
      const hash = await generatePasswordHash('password123')

      const isMatch = await checkPasswordHash('password123', hash)
      expect(isMatch).toBe(true)

      const isNotMatch = await checkPasswordHash('wrongpassword', hash)
      expect(isNotMatch).toBe(false)
    })
  })

  const superAdminRequestUser = {
    isSuperAdmin: true
  } as UserCreationParams['requestUser']

  describe('createUser', () => {
    const user = {
      name: 'Test User',
      email: 'test+create@example.com',
      password: 'password123',
      role: 'superAdmin'
    } as UserCreationParams['body']

    it('should a SuperAdmin create a new SuperAdmin user', async () => {
      const { data } = await userService.createUser({
        body: user,
        requestUser: superAdminRequestUser
      })

      expect(data?.email).toBe(user.email)
      expect(data?.name).toEqual(user.name)
      expect(data?.isSuperAdmin).toBe(true)
    })

    it('should SuperAdmin create a new admin user', async () => {
      const newUser = {
        ...user,
        role: 'admin',
        _id: 'test+admin',
        email: 'test+admin@test.com',
        organizationId: 'test+org'
      } as UserCreationParams['body']
      const { data } = await userService.createUser({
        body: newUser,
        requestUser: superAdminRequestUser
      })

      expect(data?.email).toBe(newUser.email)
      expect(data?.name).toEqual(newUser.name)
      expect(data?.isSuperAdmin).toBeUndefined()
    })

    it('should send error when a SuperAdmin create a new admin user wihtout organization', async () => {
      const newUser = {
        ...user,
        role: 'admin',
        _id: 'test+admin',
        email: 'test+admin@test.com'
      } as UserCreationParams['body']
      try {
        await userService.createUser({ body: newUser })
      } catch (error: any) {
        expect(error).toBeDefined()
        expect(error.name).toBe('resourceNotFound')
        expect(error.statusCode).toBe(404)
      }
    })

    it('should send error when Admin create a new admin user without organization', async () => {
      const newUser = {
        ...user,
        role: 'admin',
        _id: 'test+admin',
        email: 'test+admin@test.com'
      } as UserCreationParams['body']
      try {
        await userService.createUser({ body: newUser })
      } catch (error: any) {
        expect(error).toBeDefined()
        expect(error.name).toBe('resourceNotFound')
        expect(error.statusCode).toBe(404)
      }
    })
  })

  describe('RUD Operations by superAdmin', () => {
    const user = {
      _id: 'test+getUsers',
      email: 'test+getUsers@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'superAdmin'
    } as UserCreationParams['body']

    beforeEach(async () => {
      await clearDatabase()
      await userService.createUser({
        body: user,
        requestUser: superAdminRequestUser
      })
    })

    it('should return a list of users', async () => {
      const { data, pagination } = await userService.getUsers()

      expect(data?.find((d) => d.email === user.email)).toBeTruthy()
      expect(pagination?.limit).toEqual(100)
    })

    it('should return a single user', async () => {
      const result = await userService.getUser({ userId: user._id })

      expect(result?.data?.email).toEqual(user.email)
      expect(result.message).toEqual(USER_MESSAGES.findOne)
    })

    it('should throw an error if user not found', async () => {
      try {
        await userService.getUser({ userId: 'notfound' })
      } catch (error: any) {
        expect(error).toBeDefined()
        expect(error.statusCode).toBe(404)
        expect(error.message).toBe(USER_MESSAGES.not_found)
      }
    })

    it('should update a user', async () => {
      const updateEmailUser = 'updated@example.com'
      if (!user?._id) {
        throw new Error('User not created')
      }

      const { data } = await userService.updateUser(user._id, {
        email: updateEmailUser
      })

      expect(data).toBe(true)
      const updatedUser = await userRepository.findOne({
        _id: user._id
      })
      expect(updatedUser.email).toEqual(updateEmailUser)
    })

    it('should delete a user', async () => {
      if (!user?._id) {
        throw new Error('User not created')
      }

      const result = await userService.deleteUser(user._id)

      expect(result.data).toBe(true)
      const deletedUser = await userRepository.findOne({
        _id: user._id
      })
      expect(deletedUser).toBeNull()
    })
  })
})

describe('Hashing Password', () => {
  it('should compare passwords correctly', async () => {
    const password = 'T3cnico2020.'
    const hash = await generatePasswordHash(password)

    expect(hash).toBeDefined()
    const isMatch = await checkPasswordHash(password, hash)
    expect(isMatch).toBe(true)
  })

  it('should not match incorrect passwords', async () => {
    const password = 'T3cnico2020.'
    const wrongPassword = 'IncorrectPassword!'
    const hash = await generatePasswordHash(password)

    expect(hash).toBeDefined()
    const isMatch = await checkPasswordHash(wrongPassword, hash)
    expect(isMatch).toBe(false)
  })
})
