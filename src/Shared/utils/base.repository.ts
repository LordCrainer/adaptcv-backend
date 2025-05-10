import type { IBaseRepository } from '@Shared/domain/base.repository.interface'
import type {
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline
} from 'mongoose'
import type { providersDb, QueryFromCriteria } from './criteriaHandle'

import { shortId } from '@src/lib/shortId'

export class BaseRepository<T extends { _id?: string }>
  implements IBaseRepository<T>
{
  provider?: keyof providersDb
  model: Model<T>
  constructor(_model: Model<T>, _provider: keyof providersDb) {
    this.provider = _provider
    this.model = _model
  }

  updateMany?(
    filter: FilterQuery<T>,
    params: UpdateQuery<T> | UpdateWithAggregationPipeline
  ): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  deleteMany?(filter?: FilterQuery<T> | undefined): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  async counterDocuments(queries?: QueryFromCriteria): Promise<Pagination> {
    const { limit = 100, skip = 0, page = 1 } = queries ?? {}
    const total = await this.model.countDocuments({
      ...queries?.filters,
      ...queries?.or
    })
    return {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      skip
    }
  }

  async find(
    initialFilters: Partial<T>,
    queries?: QueryFromCriteria<T>
  ): Promise<T[]> {
    const {
      limit = 100,
      or,
      skip = 0,
      orderBy,
      select,
      filters
    } = queries ?? {}
    const combinedFilters = { ...initialFilters, ...filters, ...or }

    let query = this.model.find(combinedFilters)
    if (select) {
      query = query.select(select as any)
    }
    const found = await query.limit(limit).skip(skip).sort(orderBy)
    return found as unknown as T[]
  }

  async create(body: T): Promise<T> {
    body._id = body._id ?? shortId.rnd()
    const newEntity = new this.model(body)
    const created = await newEntity.save()
    return created as unknown as T
  }

  async findOne(initialFilters: any, queries?: QueryFromCriteria): Promise<T> {
    const { or, filters, orderBy, select = {} } = queries ?? {}
    const combinedFilters = { ...initialFilters, ...filters, ...or }
    let query = this.model.findOne(combinedFilters)
    if (select) {
      query.select(select as any)
    }
    if (queries?.populate) {
      query.populate(queries.populate).lean()
    }
    const found = query.sort(orderBy)
    return found as unknown as T
  }

  async update(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: any
  ): Promise<boolean> {
    const updated = await this.model.updateOne(filter, update, options)
    return updated.modifiedCount > 0
  }

  async findAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: QueryOptions<T> | null | undefined
  ): Promise<T> {
    const updated = await this.model.findOneAndUpdate(filter, update, options)

    return updated as T
  }

  async delete(filter?: FilterQuery<T>): Promise<boolean> {
    const isDeleted = await this.model.deleteOne(filter)
    return isDeleted.deletedCount > 0
  }

  async aggregate<T extends any>(pipeline: any): Promise<T> {
    const found = await this.model.aggregate(pipeline)
    return found as T
  }
}
