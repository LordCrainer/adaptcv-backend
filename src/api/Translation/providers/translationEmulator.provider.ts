import {
  ITranslationRequest,
  ITranslationResponse,
  ITranslationStrategy
} from '@Api/Translation/interfaces/translation.interface'

export class TranslationEmulatorService implements ITranslationStrategy {
  getProviderName(): string {
    return 'emulator'
  }

  getSupportedLanguages(): string[] {
    return ['en', 'es', 'fr', 'de', 'it', 'pt']
  }

  async translate(request: ITranslationRequest): Promise<ITranslationResponse> {
    const { text, from, to } = request
    const translatedText = text

    return {
      translatedText,
      characterLength: translatedText.length
    }
  }
}
