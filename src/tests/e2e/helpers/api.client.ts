import request from 'supertest'

import type { IUsers, RoleType } from '@lordcrainer/adaptcv-shared-types'

import app from '@src/config/server'

export const loginUser = async (users: IUsers) => {
  try {
    const { email, password } = users
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ email, password })

    const data = response.body.data
    return data.token
  } catch (error) {
    console.error('Error logging in user:', error)
    throw new Error('Failed to log in user')
  }
}

export const createUser = async (body: any, token: string) => {
  try {
    const response = await request(app)
      .post('/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
    return response.body.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

export const createOrganization = async (body: any, token: string) => {
  try {
    const response = await request(app)
      .post('/v1/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
    return response.body.data
  } catch (error) {
    console.error('Error creating organization:', error)
    throw new Error('Failed to create organization')
  }
}

interface CreateUserInOrganization {
  user: IUsers
  role: RoleType
  organizationId: string
  token: string
}

export const createUserInOrganization = async ({
  user,
  role,
  organizationId,
  token
}: CreateUserInOrganization) => {
  try {
    const response = await request(app)
      .post('/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        _id: user._id,
        email: user.email,
        password: user.password,
        name: user.name,
        organizationId,
        role
      })
    return response.body.data
  } catch (error) {
    console.error('createUserInOrganization', error)
    throw new Error('Failed to create user in organization')
  }
}
