import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { UserRepository } from '../interfaces/users.repository'

import { BaseRepository } from '@Shared/utils/base.repository'

import { usersModel } from './users.schema'

export class UserRepositoryMongo
  extends BaseRepository<IUsers>
  implements UserRepository
{
  constructor() {
    super(usersModel, 'mongo')
  }
}
