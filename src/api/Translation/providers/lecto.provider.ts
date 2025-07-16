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
    const { texts, from, to } = request
    const response = await axios.post(
      this.baseUrl,
      {
        texts: texts,
        to: [to],
        from: from
      },
      {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    )

    if (
      !response.data ||
      !response.data.translations ||
      response.data.translations.length === 0
    ) {
      throw new Error('Translation failed or no translations found')
    }

    const { translated_characters = 0, translations } = response.data
    const translatedText = translations[0]?.translated.join(',') || ''
    return {
      translatedText,
      characterLength: translated_characters
    }
  }
}
