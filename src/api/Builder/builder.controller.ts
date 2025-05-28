import ApiResponse from '@src/Shared/utils/apiResponse'

import { BuilderService } from './builder.service'

export class BuilderController {
  private readonly builderService: BuilderService

  constructor(builderService: BuilderService) {
    this.builderService = builderService
  }

  createBuilder: IController = async (req, res, next): Promise<void> => {
    try {
      const args = {
        name: req.body.name,
        requestUser: req.requestUser
      }
      const newBuilder = await this.builderService.createBuilder(args)

      ApiResponse.created(res).json(newBuilder)
    } catch (error) {
      next(error)
    }
  }

  getBuilders: IController = async (req, res, next): Promise<void> => {
    try {
      const args = {
        filters: req.query?.filters,
        limit: req.query?.limit,
        page: req.query?.page,
        select: req.query?.select,
        or: req.query?.or,
        orderBy: req.query?.orderBy,
        builderId: req.params.builderId
      }
      const cv = await this.builderService.getBuilders(args)
      ApiResponse.success(res).json(cv)
    } catch (error) {
      next(error)
    }
  }

  getBuilder: IController = async (req, res, next): Promise<void> => {
    const { builderId } = req.params
    try {
      const args = {
        builderId
      }
      const cv = await this.builderService.getBuilder(args)
      ApiResponse.success(res).json(cv)
    } catch (error) {
      next(error)
    }
  }

  updateBuilder: IController = async (req, res, next): Promise<void> => {
    try {
      const updatedBuilder = await this.builderService.updateBuilder(
        req.params.builderId,
        req.body
      )
      ApiResponse.success(res).json(updatedBuilder)
    } catch (error) {
      next(error)
    }
  }

  deleteBuilder: IController = async (req, res, next): Promise<void> => {
    try {
      console.log('deleteBuilder', req.params.builderId)
      const isDeleted = await this.builderService.deleteBuilder(req.params.builderId)
      ApiResponse.success(res).json(isDeleted)
    } catch (error) {
      next(error)
    }
  }
}
