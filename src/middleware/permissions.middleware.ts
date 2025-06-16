import { RequestUserData } from '@lordcrainer/adaptcv-shared-types'

import { Roles } from '@src/api/Roles/roles'
import { customError } from '@src/Shared/utils/errorUtils'

export interface PermissionParams<T = Record<string, any>> {
  requestUser: RequestUserData
  resource?: T
}

export type PermissionMethod = (params: PermissionParams) => boolean

export const superAdminPermissionRules: PermissionMethod = ({
  requestUser
}: PermissionParams) => {
  return Roles.isSuperAdmin(requestUser.currentRole)
}

export const basePermissionRules = ({ requestUser }: PermissionParams) =>
  Roles.isSuperAdmin(requestUser.currentRole) ||
  Roles.isUser(requestUser.currentRole)

export const checkPermissions = (
  permissionRules: PermissionMethod
): IController => {
  return async (req, res, next) => {
    try {
      if (!req.requestUser?.currentRole) {
        throw customError('unauthorized', 'Authentication required')
      }

      const hasPermission = permissionRules({
        requestUser: req.requestUser || {},
        resource: req.params || req.body || req.query
      })

      if (!hasPermission) {
        throw customError(
          'forbidden',
          'You do not have permission to perform this action'
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
