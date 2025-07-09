import axios from 'axios'

import {
  ITranslationRequest,
  ITranslationResponse,
  ITranslationStrategy
} from '@Api/Translation/interfaces/translation.interface'

export class LectoTranslationStrategy implements ITranslationStrategy {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(
    apiKey: string,
    baseUrl = 'https://api.lecto.ai/v1/translate/text'
  ) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  getProviderName(): string {
    return 'lecto'
  }

  getSupportedLanguages(): string[] {
    // Puedes expandir esta lista según la documentación de Lecto
    return ['en', 'es', 'fr', 'de', 'it', 'pt']
  }

  async translate(request: ITranslationRequest): Promise<ITranslationResponse> {
    const { text, sourceLanguage, targetLanguage } = request
    const response = await axios.post(
      this.baseUrl,
      {
        texts: [text],
        to: targetLanguage,
        from: sourceLanguage
      },
      {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    )
    return {
      translatedText: response.data.translations[0],
      sourceLanguage,
      targetLanguage,
      provider: 'lecto',
      confidence: response.data.confidence || undefined
    }
  }
}
