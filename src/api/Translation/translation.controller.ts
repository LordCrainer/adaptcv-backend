import { Request, Response } from 'express'

import { TranslationService } from './translation.service'

export class TranslationController {
  constructor(private translationService: TranslationService) {}

  async translate(req: Request, res: Response) {
    try {
      const { text, to, from } = req.body
      if (!text || !to || !from) {
        return res.status(400).json({ message: 'Missing required fields' })
      }
      const result = await this.translationService.translate({
        text,
        to,
        from
      })
      return res.status(200).json({ data: result })
    } catch (error: any) {
      return res.status(500).json({ message: error.message })
    }
  }
}
