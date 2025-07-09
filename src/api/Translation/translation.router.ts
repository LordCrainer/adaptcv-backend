import { Router } from 'express'

import { TranslationController } from './translation.controller'

const TranslationRouter = Router()

TranslationRouter.post('/', (req, res) => {
  TranslationController.translate(req, res)
})

export default TranslationRouter
