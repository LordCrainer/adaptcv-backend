import {
  ITranslationRequest,
  ITranslationResponse,
  ITranslationStrategy
} from '@Api/Translation/interfaces/translation.interface'
import { LectoTranslationStrategy } from '@Api/Translation/providers/lecto.provider'

const providers: Record<string, ITranslationStrategy> = {
  lecto: new LectoTranslationStrategy(process.env.LECTO_API_KEY || '')
}

export class TranslationService {
  static async translate(
    request: ITranslationRequest
  ): Promise<ITranslationResponse> {
    const provider = request.provider || 'lecto'
    const strategy = providers[provider]
    if (!strategy) throw new Error('Translation provider not supported')
    return strategy.translate(request)
  }
}
