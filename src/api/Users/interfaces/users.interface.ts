import type {
  IUsers,
  RequestUserData,
  RoleType
} from '@lordcrainer/adaptcv-shared-types'
import type { Criteria } from '@Shared/utils/criteriaHandle'

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
    isSuperAdmin?: boolean
  }
  requestUser?: RequestUserData
}
