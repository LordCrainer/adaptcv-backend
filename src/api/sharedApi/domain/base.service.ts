import type { IBaseRepository } from '@Shared/domain/base.repository.interface'
import type { Criteria, QueryFromCriteria } from '@Shared/utils/criteriaHandle'

import { extractQueryFromCriteria } from '@Shared/utils/criteriaHandle'

export interface CreatorService<T> {
  execute: (body: T) => Promise<T>
}
export interface FinderService<T> {
  execute: (id: string) => Promise<T | T[]>
}
export interface SearchService<T> {
  execute: (criteria?: Criteria) => Promise<IApiResponse<T>>
}

export interface RemoverService {
  execute: (id: string) => Promise<boolean>
}
export interface UpdaterService<T> {
  execute: (id: string, body: Partial<T>) => Promise<boolean>
}

export class BaseService<T = any> {
  extractQuery: (params?: Criteria<T>) => QueryFromCriteria<T>
  repository: IBaseRepository<T>
  constructor(repository: IBaseRepository<T>) {
    this.repository = repository
    if (this.repository.provider) {
      this.extractQuery = extractQueryFromCriteria(this.repository.provider)
    } else {
      throw new Error('Repository provider is undefined')
    }
  }
}
