import ApiResponse from '@src/Shared/utils/apiResponse'

import { BuilderService } from './builders.service'

export class BuilderController {
  private readonly builderService: BuilderService

  constructor(builderService: BuilderService) {
    this.builderService = builderService
  }

  createBuilder: IController = async (req, res, next): Promise<void> => {
    try {
      const args = {
        body: req.body,
        requestUser: req.requestUser
      }
      const newBuilder = await this.builderService.createBuilder(args)

      new ApiResponse(res).setName('created').json({ ...newBuilder })
    } catch (error) {
      next(error)
    }
  }

  getBuilders: IController = async (req, res, next): Promise<void> => {
    try {
      const args = {
        query: req.query,
        requestUser: req.requestUser
      }
      const cv = await this.builderService.getBuilders(args)
      new ApiResponse(res).setName('success').json(cv)
    } catch (error) {
      next(error)
    }
  }

  getBuilder: IController = async (req, res, next): Promise<void> => {
    try {
      const args = {
        body: { ...req.params, builderId: req.params?.builderId },
        requestUser: req.requestUser,
        query: req.query
      }
      const cv = await this.builderService.getBuilder(args)
      new ApiResponse(res).setName('success').json(cv)
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
      new ApiResponse(res).setName('success').json(updatedBuilder)
    } catch (error) {
      next(error)
    }
  }

  deleteBuilder: IController = async (req, res, next): Promise<void> => {
    try {
      console.log('deleteBuilder', req.params.builderId)
      const isDeleted = await this.builderService.deleteBuilder(
        req.params.builderId
      )
      new ApiResponse(res).setName('success').json(isDeleted)
    } catch (error) {
      next(error)
    }
  }
}
