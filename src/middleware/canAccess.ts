import type { RoleType } from '@lordcrainer/adaptcv-shared-types'

import { Roles } from '@src/api/Roles/roles'
import { customError } from '@src/Shared/utils/errorUtils'

export const canAccess = (
  rolesOrMinRole: RoleType | RoleType[]
): IController => {
  return (req, res, next) => {
    console.log('canAccess', rolesOrMinRole, req.requestUser?.name)

    const userRole = req.requestUser?.currentRole

    if (!userRole) {
      throw customError('accessDenied', 'User role not found')
    }

    if (Roles.isSuperAdmin(userRole)) {
      return next()
    }

    if (Array.isArray(rolesOrMinRole)) {
      if (!Roles.isInAllowedRoles(userRole, rolesOrMinRole)) {
        throw customError('accessDenied', 'User role not allowed in roles')
      }
    } else if (!Roles.canAccess(userRole, rolesOrMinRole)) {
      throw customError('accessDenied', 'User role not allowed')
    }

    next()
  }
}
