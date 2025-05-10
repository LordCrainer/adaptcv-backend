import type { RoleConfig, RoleType } from '@lordcrainer/adaptcv-shared-types'

export class Roles {
  private static readonly ROLES: RoleConfig = {
    superAdmin: 50,
    admin: 40,
    manager: 30,
    provider: 20,
    user: 10
  }

  private static readonly roleByCode: { [key: number]: RoleType } =
    Roles.computeRoleByCode()

  /**
   * Gets the numeric value of a role.
   * @param role - The role type (e.g., 'superAdmin', 'admin').
   * @returns The numeric value of the role.
   */
  public static byName(role: RoleType): number {
    const value = Roles.ROLES[role]
    if (value === undefined) {
      throw new Error(`Invalid role: ${role}`)
    }
    return value
  }

  /**
   * Gets the role type from its numeric value.
   * @param code - The numeric value of the role (e.g., 50, 40).
   * @returns The role type (e.g., 'superAdmin', 'admin').
   */
  public static byCode(code: number): RoleType {
    const role = Roles.roleByCode[code]
    if (!role) {
      throw new Error(`Invalid role code: ${code}`)
    }
    return role
  }

  /**
   * Checks if a user has access based on their role.
   * @param userRole - The user's role (numeric value).
   * @param requiredRole - The required role (numeric value).
   * @returns `true` if the user has access, `false` otherwise.
   */
  public static canAccess(userRole: number, requiredRole: RoleType): boolean {
    return userRole >= Roles.byName(requiredRole)
  }

  /**
   * Checks if a user's role is included in a list of allowed roles.
   * @param userRole - The user's role (numeric value).
   * @param allowedRoles - An array of allowed roles (as strings).
   * @returns `true` if the user's role is allowed, `false` otherwise.
   */
  public static isInAllowedRoles(
    userRole: number,
    allowedRoles: RoleType[]
  ): boolean {
    const userRoleName = Roles.byCode(userRole)
    return allowedRoles.includes(userRoleName)
  }

  /**
   * Checks if a user is a superAdmin.
   * @param userRole - The user's role (numeric value).
   * @returns `true` if the user is a superAdmin, `false` otherwise.
   */
  public static isSuperAdmin(userRole: number): boolean {
    return userRole === Roles.byName('superAdmin')
  }

  public static isAdmin(userRole: number): boolean {
    return userRole === Roles.byName('admin')
  }

  public static isManager(userRole: number): boolean {
    return userRole === Roles.byName('manager')
  }

  public static isProvider(userRole: number): boolean {
    return userRole === Roles.byName('provider')
  }

  public static isUser(userRole: number): boolean {
    return userRole === Roles.byName('user')
  }

  private static computeRoleByCode(): { [key: number]: RoleType } {
    return Object.entries(Roles.ROLES).reduce(
      (acc, [key, value]) => {
        acc[value] = key as RoleType
        return acc
      },
      {} as { [key: number]: RoleType }
    )
  }
}
