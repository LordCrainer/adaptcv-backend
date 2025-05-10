import type { PermissionMethod } from '@src/middleware/permissions.middleware'

import {
  basePermissionRules,
  checkPermissions
} from '@src/middleware/permissions.middleware'

type UserPermissionType =
  | 'getUser'
  | 'getUsers'
  | 'createUser'
  | 'deleteUser'
  | 'updateUser'

const userPermissionRules: Record<UserPermissionType, PermissionMethod> = {
  getUser: basePermissionRules,
  getUsers: basePermissionRules,
  createUser: basePermissionRules,
  deleteUser: basePermissionRules,
  updateUser: basePermissionRules
}

const userPermissions = checkPermissions(userPermissionRules)

export { userPermissions }
