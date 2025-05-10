import { BaseRepository } from '@Shared/utils/base.repository'

import { IUsers } from '../interfaces/users.interface'
import { UserRepository } from '../interfaces/users.repository'
import { usersModel } from './users.schema'

export class UserRepositoryMongo
  extends BaseRepository<IUsers>
  implements UserRepository
{
  constructor() {
    super(usersModel, 'mongo')
  }
}
