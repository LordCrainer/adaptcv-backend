import type {
  IUserMethods,
  IUsers,
  RequestUserData,
  RoleType,
  UsersOrganizations
} from '@lanubetv/sed-share-types'

import { Criteria } from '@Shared/utils/criteriaHandle'

export { IUsers, IUserMethods, UsersOrganizations }

export interface UserServices {
  find: (page: number, limit: number) => Promise<IUsers[]>
  findOne: (code: string) => Promise<IUsers>
  create: (body: IUsers) => Promise<IUsers>
  update: (id: string, body: IUsers) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}

export interface UserParams extends Omit<IUsers, '_id'>, Criteria<IUsers> {
  userId?: string
  details?: boolean
  requestUser?: RequestUserData
}

export interface UserCreationParams {
  body: Pick<IUsers, 'email' | 'password' | 'name'> & {
    _id?: string
    role: RoleType
    organizationId?: string
    isSuperAdmin?: boolean
  }
  requestUser?: RequestUserData
}
