import type { UserParams } from './interfaces/users.interface'

import ApiResponse from '@Shared/utils/apiResponse'

import { UserService } from './users.service'

export class UsersController {
  private readonly userService: UserService

  constructor(userService: UserService) {
    this.userService = userService
  }
  getUsers: IController<UserParams> = async (req, res, next) => {
    try {
      const args = {
        filters: req.query?.filters,
        limit: req.query?.limit,
        page: req.query?.page,
        select: req.query?.select,
        or: req.query?.or,
        orderBy: req.query?.orderBy
      } as UserParams

      const users = await this.userService.getUsers(args)

      return ApiResponse.success(res).json(users)
    } catch (error) {
      next(error)
    }
  }

  getUser: IController = async (req, res, next) => {
    try {
      const { userId } = req.params
      const args = {
        userId
      } as UserParams

      const user = await this.userService.getUser(args)

      return ApiResponse.success(res).json(user)
    } catch (error) {
      next(error)
    }
  }

  createUser: IController = async (req, res, next) => {
    try {
      const args = {
        body: req?.body,
        requestUser: req?.requestUser
      }

      const user = await this.userService.createUser(args)

      ApiResponse.created(res).json(user)
    } catch (error) {
      next(error)
    }
  }

  updateUser: IController = async (req, res, next) => {
    try {
      const { id } = req.params
      const body = req.body

      const isUpdated = await this.userService.updateUser(id, body)

      ApiResponse.success(res).json(isUpdated)
    } catch (error) {
      next(error)
    }
  }

  deleteUser: IController = async (req, res, next) => {
    try {
      const { id } = req.params

      const isDeleted = await this.userService.deleteUser(id)

      ApiResponse.success(res).json(isDeleted)
    } catch (error) {
      next(error)
    }
  }
}
