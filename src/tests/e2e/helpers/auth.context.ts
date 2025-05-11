import type { RoleType } from '@lordcrainer/adaptcv-shared-types'

import { Roles } from '@src/api/Roles/roles'
import { usersSeederInput } from '@src/tests/seeders/users.seeder'

import { createUser, loginUser } from './api.client'

type AuthTokens = Record<RoleType, string>

const globalAuth: Partial<AuthTokens> = {}

export const setAuthToken = (role: RoleType, token: string) => {
  globalAuth[role] = token
}

export const getAuthToken = async (role: RoleType): Promise<string> => {
  if (globalAuth[role]) return globalAuth[role]!

  const token = await generateTokenForRole(role)
  globalAuth[role] = token
  return token
}

const generateTokenForRole = async (role: RoleType) => {
  const roleValue = Roles.byName(role)
  if (Roles.isSuperAdmin(roleValue)) {
    return loginUser(usersSeederInput.superAdmin)
  }
  if (Roles.isAdmin(roleValue)) {
    const superAdminToken = await getAuthToken('superAdmin')
    await createUser(usersSeederInput.admin, superAdminToken)

    return loginUser(usersSeederInput.admin)
  }

  if (Roles.isUser(roleValue)) {
    const superAdminToken = await getAuthToken('superAdmin')

    return loginUser(usersSeederInput.user)
  }

  throw new Error(`Role ${role} not supported`)
}
