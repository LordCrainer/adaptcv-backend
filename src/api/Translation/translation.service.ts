import {
  ITranslationRequest,
  ITranslationResponse,
  ITranslationStrategy,
  TranslationProviderName
} from '@Api/Translation/interfaces/translation.interface'
import { GeminiTranslationStrategy } from '@Api/Translation/providers/gemini.provider'
import { LectoTranslationStrategy } from '@Api/Translation/providers/lecto.provider'

import { TranslationEmulatorService } from './providers/translationEmulator.provider'

const providers: Record<TranslationProviderName, ITranslationStrategy> = {
  lecto: new LectoTranslationStrategy(process.env.LECTO_API_KEY || ''),
  emulator: new TranslationEmulatorService(),
  gemini: new GeminiTranslationStrategy(process.env.GEMINI_API_KEY || '')
}

export class TranslationService {
  constructor(private readonly provider: TranslationProviderName) {
    this.provider = provider
  }
  async translate(
    request: ITranslationRequest
  ): Promise<IApiResponse<ITranslationResponse>> {
    const strategy = providers[this.provider]
    if (!strategy) throw new Error('Translation provider not supported')
    return {
      data: await strategy.translate(request),
      message: 'Translation successful'
    }
  }
}
