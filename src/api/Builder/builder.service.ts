import type { IBuilder } from '@lordcrainer/adaptcv-shared-types'

import { shortId } from '@src/lib/shortId'
import { customError } from '@src/Shared/utils/errorUtils'

import { BaseService } from '../sharedApi/domain/base.service'
import { BuilderMessages } from './constants/builder.messages'
import {
  BuilderParams,
  CreateBuilderPayload
} from './interfaces/builder.interface'
import { BuilderRepository } from './interfaces/builder.repository'

export class BuilderService extends BaseService<IBuilder> {
  private readonly builderRepository: BuilderRepository

  constructor(builderRepository: BuilderRepository) {
    super(builderRepository)
    this.builderRepository = builderRepository
  }

  async getBuilders(
    body?: Partial<BuilderParams>
  ): Promise<IApiResponse<IBuilder[]>> {
    const queries = this.extractQuery(body)
    const builders = await this.builderRepository.find({}, queries)
    const pagination = await this.builderRepository.counterDocuments(queries)
    return {
      message: BuilderMessages.BUILDER_FOUND,
      data: builders,
      pagination
    }
  }

  async getBuilder(
    body: Partial<BuilderParams>
  ): Promise<IApiResponse<IBuilder>> {
    const builder = await this.builderRepository.findOne({
      _id: body.builderId
    })
    return {
      message: BuilderMessages.BUILDER_FOUND,
      data: builder
    }
  }

  async createBuilder(
    body: CreateBuilderPayload['body']
  ): Promise<IApiResponse<IBuilder>> {
    const newBuilder = {
      _id: body?._id || shortId.rnd(),
      name: body.name,
      status: 'draft'
    } as IBuilder
    const createdBuilder = await this.builderRepository.create(newBuilder)
    if (!createdBuilder) {
      throw customError('resourceNotFound', BuilderMessages.BUILDER_NOT_CREATED)
    }
    return {
      message: BuilderMessages.BUILDER_CREATED,
      data: createdBuilder
    }
  }

  async updateBuilder(
    builderId: string,
    updates: Partial<IBuilder>
  ): Promise<IApiResponse<boolean>> {
    const isUpdated = await this.builderRepository.update(
      { _id: builderId },
      { $set: updates }
    )
    return {
      message: BuilderMessages.BUILDER_UPDATED,
      data: isUpdated
    }
  }

  async deleteBuilder(builderId: string): Promise<IApiResponse<boolean>> {
    const isDeleted = await this.builderRepository.delete({ _id: builderId })
    return {
      message: BuilderMessages.BUILDER_DELETED,
      data: isDeleted
    }
  }
}
