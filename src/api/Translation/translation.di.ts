import { TranslationController } from './translation.controller'
import { TranslationService } from './translation.service'

const translationService = new TranslationService('gemini')

export const injectionController = new TranslationController(translationService)
