import { TranslationController } from './translation.controller'
import { TranslationService } from './translation.service'

const translationService = new TranslationService('lecto')

export const injectionController = new TranslationController(translationService)
