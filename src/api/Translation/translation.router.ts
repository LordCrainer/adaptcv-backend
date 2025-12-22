import { Router } from 'express'

import { injectionController } from './translation.di'

const TranslationRouter = Router()

TranslationRouter.post('/', injectionController.translate)

export default TranslationRouter
