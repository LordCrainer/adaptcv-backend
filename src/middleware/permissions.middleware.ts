import { Roles } from '@src/api/Roles/roles'
import { customError } from '@src/Shared/utils/errorUtils'

export interface PermissionParams {
  currentRole: number
  reqUserId?: string
}

export type PermissionMethod = (params: PermissionParams) => boolean

export const basePermissionRules = (params: PermissionParams) =>
  Roles.isSuperAdmin(params.currentRole) || Roles.isUser(params.currentRole)

export const checkPermissions = (
  permissionRules: PermissionMethod
): IController => {
  return async (req, res, next) => {
    try {
      const { currentRole, _id: reqUserId } = req.requestUser || {}

      if (!currentRole) {
        throw customError('unauthorized', 'Authentication required')
      }

      const hasPermission = permissionRules({
        currentRole,
        reqUserId: reqUserId || ''
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
