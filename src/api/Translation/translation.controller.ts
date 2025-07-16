import { Request, Response } from 'express'

import ApiResponse from '@src/Shared/utils/apiResponse'

import { TranslationService } from './translation.service'

export class TranslationController {
  constructor(private translationService: TranslationService) {}

  translate: IController = async (req, res, next) => {
    try {
      const { texts, to, from } = req.body
      if (!texts || !to || !from) {
        return res.status(400).json({ message: 'Missing required fields' })
      }
      const result = await this.translationService.translate({
        texts,
        to,
        from
      })
      return new ApiResponse(res).setName('accepted').json({ ...result })
    } catch (error) {
      next(error)
    }
  }
}
