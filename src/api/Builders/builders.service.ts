import Joi from 'joi'

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

const builderSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  _id: Joi.string().optional(),
  status: Joi.string().valid('draft', 'published').optional(),
  description: Joi.string().optional(),
  createdBy: Joi.string().optional()
})

export class BuilderService extends BaseService<IBuilder> {
  private readonly builderRepository: BuilderRepository

  constructor(builderRepository: BuilderRepository) {
    super(builderRepository)
    this.builderRepository = builderRepository
  }

  /**
   * Obtiene la lista de builders del usuario autenticado.
   */
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

  /**
   * Obtiene un builder por ID, validando que pertenezca al usuario.
   * Lanza error si no existe.
   */
  async getBuilder(
    requestDto: Partial<BuilderParams>
  ): Promise<IApiResponse<IBuilder>> {
    const { body, requestUser } = requestDto
    const reqUserId = requestUser?._id
    const builder = await this.builderRepository.findOne({
      _id: body?.builderId,
      createdBy: reqUserId
    })
    if (!builder) {
      throw customError('resourceNotFound', BuilderMessages.BUILDER_NOT_FOUND)
    }
    return {
      message: BuilderMessages.BUILDER_FOUND,
      data: builder
    }
  }

  /**
   * Crea un nuevo builder validando los datos de entrada.
   */
  async createBuilder(
    requestDto: CreateBuilderPayload
  ): Promise<IApiResponse<IBuilder>> {
    const { body, requestUser } = requestDto
    const { error } = builderSchema.validate(body)
    if (error) {
      throw customError('validationParams', error.message)
    }
    const newBuilder = {
      _id: body?._id || shortId.rnd(),
      name: body?.name,
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

  /**
   * Actualiza un builder existente validando los datos y existencia.
   */
  async updateBuilder(
    builderId: string,
    updates: Partial<IBuilder>
  ): Promise<IApiResponse<boolean>> {
    if (updates.name) {
      const { error } = builderSchema.validate({ name: updates.name })
      if (error) {
        throw customError('validationParams', error.message)
      }
    }
    const isUpdated = await this.builderRepository.update(
      { _id: builderId },
      { $set: updates }
    )
    if (!isUpdated) {
      throw customError('resourceNotFound', BuilderMessages.BUILDER_NOT_FOUND)
    }
    return {
      message: BuilderMessages.BUILDER_UPDATED,
      data: isUpdated
    }
  }

  /**
   * Elimina un builder por ID, lanzando error si no existe.
   */
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

  /**
   * Duplicates an existing builder, appending ' Copy' to its name.
   */
  async duplicateBuilder(builderId: string): Promise<IApiResponse<IBuilder>> {
    const existing = await this.builderRepository.findOne({ _id: builderId })
    if (!existing) {
      throw customError('resourceNotFound', BuilderMessages.BUILDER_NOT_FOUND)
    }
    const newBuilder = {
      ...existing,
      _id: shortId.rnd(),
      name: [existing.name, 'Copy'].join(' ') || `New Builder CV`
    } as IBuilder
    const createdBuilder = await this.builderRepository.create(newBuilder)
    if (!createdBuilder) {
      throw customError('resourceNotFound', BuilderMessages.BUILDER_NOT_CREATED)
    }
    return {
      message: BuilderMessages.BUILDER_DUPLICATED,
      data: createdBuilder
    }
  }
}
