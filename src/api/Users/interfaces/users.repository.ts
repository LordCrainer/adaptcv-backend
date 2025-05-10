import { IBaseRepository } from '@Shared/domain/base.repository.interface'
import { MapType } from '@Shared/utils/utilities'

import { IUserMethods, IUsers } from './users.interface'

interface Repository<T> extends IBaseRepository<T> {}

export interface UserDocument extends IUsers, IUserMethods {}

export type UserRepository = MapType<Repository<IUsers>>
