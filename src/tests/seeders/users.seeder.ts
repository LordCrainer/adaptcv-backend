import type { RoleType } from '@lordcrainer/adaptcv-shared-types'

import { usersModel } from '@src/api/Users/repository/users.schema'

import { Roles } from './../../api/Roles/roles'

interface UsersSeederInputData {
  _id: string
  email: string
  password: string
  name: string
  role?: RoleType
}

interface UsersSeederInput {
  superAdmin: UsersSeederInputData
  user: UsersSeederInputData
}

export const usersSeederInput: UsersSeederInput = {
  superAdmin: {
    _id: 'id-superAdmin',
    email: 'superadmin@acv-test.com',
    password: 'password_superadmin',
    name: 'Super Admin',
    role: 'superAdmin'
  },
  user: {
    _id: 'user',
    email: 'user@acv-test.com',
    password: 'password_user',
    name: 'User',
    role: 'user'
  }
}

export const seedSuperAdminDb = async () => {
  const role = Roles.byName(usersSeederInput.superAdmin.role!)
  await usersModel.create({
    ...usersSeederInput.superAdmin,
    role,
    isSuperAdmin: true
  })
}
