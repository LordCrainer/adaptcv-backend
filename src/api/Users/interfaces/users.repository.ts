import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { IBaseRepository } from '@Shared/domain/base.repository.interface'
import type { MapType } from '@src/Shared/utils/hash.handle'

interface Repository<T> extends IBaseRepository<T> {}

export interface IUserExtend extends IUsers {}

export type UserRepository = MapType<Repository<IUserExtend>>
