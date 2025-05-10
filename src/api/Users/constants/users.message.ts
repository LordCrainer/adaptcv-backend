import type { ApiMessages } from '@Shared/utils/define'

interface UserMessages extends Partial<ApiMessages> {}

export const USER_MESSAGES: UserMessages = {
  updated: 'updated User',
  created: 'created User',
  deleted: 'deleted User',
  findOne: 'found User',
  find: 'found Users',
  not_found: 'Not found User',
  not_created: 'Not created User',
  not_updated: 'Not updated User',
  not_deleted: 'Not deleted User'
}
