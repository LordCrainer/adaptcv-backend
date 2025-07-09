import {
  ITranslationRequest,
  ITranslationResponse,
  ITranslationStrategy
} from '@Api/Translation/interfaces/translation.interface'
import { LectoTranslationStrategy } from '@Api/Translation/providers/lecto.provider'

import { TranslationEmulatorService } from './providers/translationEmulator.provider'

const providers: Record<string, ITranslationStrategy> = {
  lecto: new LectoTranslationStrategy(process.env.LECTO_API_KEY || ''),
  emulator: new TranslationEmulatorService()
}

export class TranslationService {
  private readonly provider: string
  constructor(provider?: string) {
    this.provider = provider || 'lecto'
  }
  async translate(request: ITranslationRequest): Promise<ITranslationResponse> {
    const strategy = providers[this.provider]
    if (!strategy) throw new Error('Translation provider not supported')
    return strategy.translate(request)
  }
}
