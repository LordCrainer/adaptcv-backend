import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { IBaseRepository } from '@Shared/domain/base.repository.interface'
import type { MapType } from '@Shared/utils/utilities'

interface Repository<T> extends IBaseRepository<T> {}

export interface UserDocument extends IUsers {}

export type UserRepository = MapType<Repository<UserDocument>>
