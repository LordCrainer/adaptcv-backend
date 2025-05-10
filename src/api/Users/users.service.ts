import jwt from 'jsonwebtoken'

import type {
  IUsers,
  UserCreationParams,
  UserParams,
  UsersOrganizations
} from './interfaces/users.interface'
import type { UserRepository } from './interfaces/users.repository'

import { customError } from '@Shared/utils/errorUtils'
import { AUTH_MESSAGES } from '@src/api/Auth/constants/auth.messages'
import { Roles } from '@src/api/Roles/roles'
import config from '@src/config/environments'
import { shortId } from '@src/lib/shortId'

import { BaseService } from '../sharedApi/domain/base.service'
import { USER_MESSAGES } from './constants/users.message'
import { validationCreateUser } from './helpers/users.validation'

/**
 * @export
 */
export class UserService extends BaseService<IUsers> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository)
  }

  async updateUser(
    userId: string,
    body: Partial<IUsers>
  ): Promise<IApiResponse<boolean>> {
    const isUpdated = await this.userRepository.update(
      { _id: userId },
      { $set: body }
    )
    return {
      data: isUpdated,
      message: USER_MESSAGES.updated
    }
  }

  async createUser(params: UserCreationParams): Promise<IApiResponse<IUsers>> {
    const { body, requestUser } = params

    validationCreateUser(body)

    const role = Roles.byName(body.role)

    const isSuperAdmin =
      (Roles.isSuperAdmin(role) && requestUser?.isSuperAdmin) || undefined

    if (!isSuperAdmin && !body?.organizationId) {
      throw customError('resourceNotFound', 'Organization not found')
    }

    const user = await this.registerUser({ ...body, isSuperAdmin })

    if (!isSuperAdmin && body?.organizationId) {
      await this.hireUserToOrganization({
        userId: user._id,
        organizationId: body.organizationId,
        name: body.name,
        role
      })
    }

    return {
      data: user,
      message: USER_MESSAGES.created
    }
  }

  private async registerUser(body: UserCreationParams['body']) {
    const savedUser: IUsers = await this.userRepository.create({
      _id: body._id || shortId.rnd(),
      email: body.email,
      name: body.name,
      password: body.password,
      isSuperAdmin: body.isSuperAdmin
    })

    if (!savedUser) {
      throw customError('resourceNotFound', USER_MESSAGES.not_created)
    }

    return {
      _id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      isSuperAdmin: savedUser.isSuperAdmin
    } as IUsers
  }

  async getUsers(params?: UserParams): Promise<IApiResponse<IUsers[]>> {
    const queries = this.extractQuery(params)
    const foundUsers = await this.userRepository.find({}, queries)
    const pagination = await this.userRepository.counterDocuments(queries)
    return {
      data: foundUsers,
      pagination,
      message: USER_MESSAGES.find
    }
  }

  async getUser(params: Partial<UserParams>): Promise<IApiResponse<IUsers>> {
    const foundOneUser = await this.userRepository.findOne({
      _id: params.userId
    })
    if (!foundOneUser) {
      throw customError('notFound', USER_MESSAGES.not_found)
    }
    return {
      data: foundOneUser,
      message: USER_MESSAGES.findOne
    }
  }

  async deleteUser(userId: string): Promise<IApiResponse<boolean>> {
    const isDeleted = await this.userRepository.delete({ _id: userId })
    return {
      data: isDeleted,
      message: USER_MESSAGES.deleted
    }
  }

  private async hireUserToOrganization(
    params: { userId: string; _id?: string } & Omit<UsersOrganizations, '_id'>
  ) {
    const organzation: UsersOrganizations = {
      _id: shortId.rnd(),
      organizationId: params.organizationId,
      name: params.name,
      role: params.role,
      status: params?.status,
      profile: params?.profile
    }

    const isHired = await this.userRepository.update(
      { _id: params.userId },
      { $push: { organizations: organzation } }
    )

    if (!isHired) {
      throw customError('resourceNotFound', 'User not hired')
    }

    await this.organizationsRepository.update(
      { _id: params.organizationId },
      {
        $set: { updatedAt: new Date() }
      }
    )

    return { isHired, organzation }
  }

  verifyToken(token: string): jwt.JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret)
      return decoded as jwt.JwtPayload
    } catch (error) {
      throw customError('invalidToken', AUTH_MESSAGES.invalid_token)
    }
  }
}
