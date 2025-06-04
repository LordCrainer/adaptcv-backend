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

      new ApiResponse(res).setName('success').json(users)
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

      new ApiResponse(res).setName('success').json(user)
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

      new ApiResponse(res).setName('created').json(user)
    } catch (error) {
      next(error)
    }
  }

  updateUser: IController = async (req, res, next) => {
    try {
      const { id } = req.params
      const body = req.body

      const isUpdated = await this.userService.updateUser(id, body)

      new ApiResponse(res).setName('success').json(isUpdated)
    } catch (error) {
      next(error)
    }
  }

  deleteUser: IController = async (req, res, next) => {
    try {
      const { id } = req.params

      const isDeleted = await this.userService.deleteUser(id)

      new ApiResponse(res).setName('success').json(isDeleted)
    } catch (error) {
      next(error)
    }
  }
}
