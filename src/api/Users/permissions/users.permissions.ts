import type { PermissionMethod } from '@src/middleware/permissions.middleware'

import { Roles } from '@src/api/Roles/roles'
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

const viewUserPermission: PermissionMethod = (params) => {
  return (
    Roles.isSuperAdmin(params.currentRole) || Roles.isUser(params.currentRole)
  )
}

const userPermissionRules: Record<UserPermissionType, PermissionMethod> = {
  getUser: viewUserPermission,
  getUsers: viewUserPermission,
  createUser: basePermissionRules,
  deleteUser: basePermissionRules,
  updateUser: basePermissionRules
}

export const userAccess = {
  get: checkPermissions(viewUserPermission),
  list: checkPermissions(viewUserPermission),
  create: checkPermissions(basePermissionRules),
  delete: checkPermissions(basePermissionRules),
  update: checkPermissions(basePermissionRules)
}
