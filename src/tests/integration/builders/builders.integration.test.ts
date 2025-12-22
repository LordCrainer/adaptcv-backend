import { IBuilder, RequestUserData } from '@lordcrainer/adaptcv-shared-types'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { beforeEach } from 'node:test'

import { BuilderRepository } from '@src/api/Builders/builders.repository'
import { BuilderService } from '@src/api/Builders/builders.service'
import { dbStrategy } from '@src/config/db/dbStrategy'

const selectedDb = dbStrategy.mongoMemory

let builderService: BuilderService
let builderRepository: BuilderRepository

describe('Builder Integration Tests', () => {
  const requestUser: RequestUserData = {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    status: 'active',
    currentRole: 1
  }
  beforeAll(async () => {
    builderRepository = new BuilderRepository()
    builderService = new BuilderService(builderRepository)
    await selectedDb.connect('acv-user-test')
    await selectedDb.clear()
  })

  beforeEach(async () => {
    await selectedDb.clear()
  })

  afterAll(async () => {
    await selectedDb.disconnect()
  })

  it('should create a builder in the database', async () => {
    const builderData = {
      name: 'Integration Builder',
      description: 'Integration Test'
    }
    const { data } = await builderService.createBuilder({
      body: builderData,
      requestUser
    })

    expect(data).toHaveProperty('_id')
    expect(data?.name).toBe(builderData.name)
  })

  it('should update a builder in the database', async () => {
    const builderData = {
      name: 'Update Builder',
      description: 'Integration Test'
    }
    const { data: createdBuilder } = await builderService.createBuilder({
      body: builderData,
      requestUser
    })
    const updatedData = { name: 'Updated Builder' }
    const { data: updatedBuilder } = await builderService.updateBuilder(
      createdBuilder?._id as string,
      updatedData
    )
    expect(updatedBuilder).toBeTruthy()
    const foundBuilder = await builderRepository.findOne({
      _id: createdBuilder?._id
    })
    expect(foundBuilder.name).toBe(updatedData.name)
  })

  it('should duplicate a builder in the database', async () => {
    const builderData = {
      name: 'Original Builder',
      description: 'Integration Duplicate Test',
      createdBy: requestUser._id,
      status: 'draft'
    } as IBuilder
    const { data: createdBuilder } = await builderService.createBuilder({
      body: builderData,
      requestUser
    })
    const { data: duplicatedBuilder } = await builderService.duplicateBuilder(
      createdBuilder._id as string
    )

    expect(duplicatedBuilder).toHaveProperty('_id')
    expect(duplicatedBuilder._id).not.toBe(createdBuilder._id)
    expect(duplicatedBuilder.name).toBe(`${createdBuilder.name} Copy`)

    const foundOriginal = await builderRepository.findOne({
      _id: createdBuilder._id
    })
    const foundDuplicate = await builderRepository.findOne({
      _id: duplicatedBuilder._id
    })
    expect(foundOriginal).toBeTruthy()
    expect(foundDuplicate).toBeTruthy()
    expect(foundDuplicate?._id).toBe(duplicatedBuilder._id)
  })
})
