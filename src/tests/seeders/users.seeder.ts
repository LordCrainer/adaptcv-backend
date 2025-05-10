// src/tests/seeder.ts
import type { RoleType } from '@lordcrainer/adaptcv-shared-types'

import { usersModel } from '@src/api/Users/repository/users.schema'

interface UsersSeederInputData {
  _id: string
  email: string
  password: string
  name: string
  role?: RoleType
}

interface UsersSeederInput {
  superAdmin: UsersSeederInputData
  admin: UsersSeederInputData
  user: UsersSeederInputData
}

export const usersSeederInput: UsersSeederInput = {
  superAdmin: {
    _id: 'id-superAdmin',
    email: 'superadmin@test.com',
    password: 'password_superadmin',
    name: 'Super Admin',
    role: 'superAdmin'
  },
  admin: {
    _id: 'admin',
    email: 'admin@test.com',
    password: 'password_admin',
    name: 'Admin',
    role: 'admin'
  },
  user: {
    _id: 'user',
    email: 'user@test.com',
    password: 'password_user',
    name: 'User',
    role: 'user'
  }
}

export const seedSuperAdminDb = async () => {
  await usersModel.create({
    ...usersSeederInput.superAdmin,
    isSuperAdmin: true
  })
}
