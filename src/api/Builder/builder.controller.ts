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
    const { builder } = req.params
    const updates = req.body
    try {
      const updatedBuilder = await this.builderService.updateBuilder(
        builder,
        updates
      )
      ApiResponse.success(res).json(updatedBuilder)
    } catch (error) {
      next(error)
    }
  }

  deleteBuilder: IController = async (req, res, next): Promise<void> => {
    const { builder } = req.params
    try {
      await this.builderService.deleteBuilder(builder)
      ApiResponse.noContent(res)
    } catch (error) {
      next(error)
    }
  }
}
