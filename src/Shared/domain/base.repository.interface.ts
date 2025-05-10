import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline
} from 'mongoose'

import { providersDb, QueryFromCriteria } from '@Shared/utils/criteriaHandle'

export interface IWrite<T> {
  update(
    filter: FilterQuery<T>,
    params: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions<T> | null | undefined
  ): Promise<boolean>
  findAndUpdate?(
    filter: FilterQuery<T>,
    params: UpdateQuery<T>,
    options?: QueryOptions<T> | null | undefined
  ): Promise<T>
  updateMany?(
    filter: FilterQuery<T>,
    params: UpdateWithAggregationPipeline | UpdateQuery<T>
  ): Promise<boolean>
  delete(filter?: FilterQuery<T>): Promise<boolean>
  deleteMany?(filter?: FilterQuery<T>): Promise<boolean>
  create(body: T): Promise<T>
}

export interface IRead<T> {
  find(
    initialFilters: FilterQuery<T>,
    queries?: QueryFromCriteria<T>
  ): Promise<T[]>
  findOne(
    initialFilters: FilterQuery<T>,
    queries?: QueryFromCriteria<T>
  ): Promise<T>
  counterDocuments(queries: QueryFromCriteria): Promise<Pagination>
}

export interface IAdvance {
  aggregate<T = any>(pipeline: object): Promise<T>
}

export interface IBaseRepository<T> extends IWrite<T>, IRead<T>, IAdvance {
  provider?: keyof providersDb
}
