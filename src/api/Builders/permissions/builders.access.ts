import {
  basePermissionRules,
  checkPermissions
} from '@src/middleware/permissions.middleware'

export const builderAccess = {
  create: checkPermissions(basePermissionRules),
  get: checkPermissions(basePermissionRules),
  list: checkPermissions(basePermissionRules),
  delete: checkPermissions(basePermissionRules),
  update: checkPermissions(basePermissionRules)
}
