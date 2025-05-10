import { RoleType } from '@lanubetv/sed-share-types'

import { Roles } from '@src/api/Roles/roles'
import { organizationsSeeder } from '@src/tests/seeders/organizations.seeder'
import { usersSeederInput } from '@src/tests/seeders/users.seeder'

import {
  createOrganization,
  createUserInOrganization,
  loginUser
} from './api.client'

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
    const org = await createOrganization(
      organizationsSeeder.organization1,
      superAdminToken
    )

    await createUserInOrganization({
      user: usersSeederInput.admin,
      role: 'admin',
      organizationId: org._id,
      token: superAdminToken
    })

    return loginUser(usersSeederInput.admin)
  }

  if (Roles.isUser(roleValue)) {
    const superAdminToken = await getAuthToken('superAdmin')
    const org = await createOrganization(
      organizationsSeeder.organization2,
      superAdminToken
    )
    await createUserInOrganization({
      user: usersSeederInput.user,
      role: 'user',
      organizationId: org._id,
      token: superAdminToken
    })
    return loginUser(usersSeederInput.user)
  }

  throw new Error(`Role ${role} not supported`)
}
