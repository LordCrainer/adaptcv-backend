import { Roles } from '@src/api/Roles/roles'
import { customError } from '@src/Shared/utils/errorUtils'

export interface PermissionParams {
  role: number
  organizationId?: string
}

export type PermissionMethod = (params: PermissionParams) => boolean

export const basePermissionRules = (params: PermissionParams) =>
  Roles.isSuperAdmin(params.role) || !!params.organizationId

export const checkPermissions =
  <T extends string>(permissionRules: Record<T, PermissionMethod>) =>
  (action: T): IController => {
    return (req, res, next) => {
      const { currentRole, currentOrgId } = req.requestUser || {}
      if (
        currentRole &&
        !permissionRules[action]?.({
          role: currentRole,
          organizationId: currentOrgId
        })
      ) {
        throw customError(
          'forbidden',
          'You do not have permission to perform this action'
        )
      }
      next()
    }
  }
