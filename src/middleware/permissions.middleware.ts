import { Roles } from '@src/api/Roles/roles'
import { customError } from '@src/Shared/utils/errorUtils'

export interface PermissionParams {
  role: number
}

export type PermissionMethod = (params: PermissionParams) => boolean

export const basePermissionRules = (params: PermissionParams) =>
  Roles.isSuperAdmin(params.role)

export const checkPermissions =
  <T extends string>(permissionRules: Record<T, PermissionMethod>) =>
  (action: T): IController => {
    return (req, res, next) => {
      const { currentRole } = req.requestUser || {}
      if (
        currentRole &&
        !permissionRules[action]?.({
          role: currentRole
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
