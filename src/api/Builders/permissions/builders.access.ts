import { IBuilder } from '@lordcrainer/adaptcv-shared-types'

import {
  basePermissionRules,
  checkPermissions,
  PermissionParams,
  superAdminPermissionRules
} from '@src/middleware/permissions.middleware'

function permissionRuleByCreatedBy(
  params: PermissionParams<Partial<IBuilder>>
) {
  if (superAdminPermissionRules(params)) {
    return true
  }
  return params.resource?.createdBy === params.requestUser._id
}

export const builderAccess = {
  create: checkPermissions(basePermissionRules, 'body'),
  get: checkPermissions(basePermissionRules, 'params'),
  list: checkPermissions(basePermissionRules, 'query'),
  delete: checkPermissions(permissionRuleByCreatedBy, 'params'),
  update: checkPermissions(permissionRuleByCreatedBy, 'params')
}
