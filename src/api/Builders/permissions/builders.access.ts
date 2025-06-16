import {
  basePermissionRules,
  checkPermissions,
  PermissionParams,
  superAdminPermissionRules
} from '@src/middleware/permissions.middleware'

function permissionRuleByCreatedBy(params: PermissionParams) {
  if (superAdminPermissionRules(params)) {
    return true
  }
  return params.resource?.createdBy === params.requestUser._id
}

export const builderAccess = {
  create: checkPermissions(basePermissionRules),
  get: checkPermissions(basePermissionRules),
  list: checkPermissions(basePermissionRules),
  delete: checkPermissions(permissionRuleByCreatedBy),
  update: checkPermissions(permissionRuleByCreatedBy)
}
