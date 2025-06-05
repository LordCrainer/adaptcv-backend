import type { IBuilder } from '@lordcrainer/adaptcv-shared-types'
import type { IBaseRepository } from '@Shared/domain/base.repository.interface'
import type { MapType } from '@Shared/utils/utilities'

interface Repository<T> extends IBaseRepository<T> {}

export interface BuilderExtended extends IBuilder {}

export type BuilderRepository = MapType<Repository<BuilderExtended>>
