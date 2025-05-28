import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { BuilderRepository } from '@src/api/Builder/builder.repository'
import { BuilderService } from '@src/api/Builder/builder.service'
import { dbStrategy } from '@src/config/db/dbStrategy'

const selectedDb = dbStrategy.mongoMemory

let builderService: BuilderService
let builderRepository: BuilderRepository

describe('Builder Integration Tests', () => {
  beforeAll(async () => {
    builderRepository = new BuilderRepository()
    builderService = new BuilderService(builderRepository)
  })

  beforeAll(async () => {
    await selectedDb.connect('acv-user-test')
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
    const { data } = await builderService.createBuilder(builderData)
    expect(data).toHaveProperty('_id')
    expect(data?.name).toBe(builderData.name)
  })

  it('should update a builder in the database', async () => {
    const builderData = {
      name: 'Update Builder',
      description: 'Integration Test'
    }
    const { data: createdBuilder } =
      await builderService.createBuilder(builderData)
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
})
