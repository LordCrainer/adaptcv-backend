import type { IBuilder } from '@lordcrainer/adaptcv-shared-types'

import { shortId } from '@src/lib/shortId'
import { customError } from '@src/Shared/utils/errorUtils'

import { BaseService } from '../sharedApi/domain/base.service'
import { BuilderMessages } from './constants/builders.messages'
import {
  BuilderParams,
  CreateBuilderPayload
} from './interfaces/builders.interface'
import { BuilderRepository } from './interfaces/builders.repository'

export class BuilderService extends BaseService<IBuilder> {
  private readonly builderRepository: BuilderRepository

  constructor(builderRepository: BuilderRepository) {
    super(builderRepository)
    this.builderRepository = builderRepository
  }

  async getBuilders(
    requestDto?: Partial<BuilderParams>
  ): Promise<IApiResponse<IBuilder[]>> {
    const queries = this.extractQuery(requestDto?.query)
    const reqUserId = requestDto?.requestUser?._id
    const builders = await this.builderRepository.find(
      { createdBy: reqUserId },
      queries
    )
    const pagination = await this.builderRepository.counterDocuments(queries)
    return {
      message: BuilderMessages.BUILDER_FOUND,
      data: builders,
      pagination
    }
  }

  async getBuilder(
    requestDto: Partial<BuilderParams>
  ): Promise<IApiResponse<IBuilder>> {
    const { body, requestUser } = requestDto
    const reqUserId = requestUser?._id
    const builder = await this.builderRepository.findOne({
      _id: body?.builderId,
      createdBy: reqUserId
    })
    return {
      message: BuilderMessages.BUILDER_FOUND,
      data: builder
    }
  }

  async createBuilder(
    requestDto: CreateBuilderPayload
  ): Promise<IApiResponse<IBuilder>> {
    const { body, requestUser } = requestDto
    const newBuilder = {
      _id: body?._id || shortId.rnd(),
      name: body.name,
      status: 'draft',
      createdBy: requestUser?._id
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
    if (!isDeleted) {
      throw customError('resourceNotFound', BuilderMessages.BUILDER_NOT_DELETED)
    }
    return {
      message: BuilderMessages.BUILDER_DELETED,
      data: isDeleted
    }
  }
}
