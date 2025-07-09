import { Router } from 'express'

import { injectionController } from './translation.di'

const TranslationRouter = Router()

TranslationRouter.post('/', (req, res) => {
  injectionController.translate(req, res)
})

export default TranslationRouter
