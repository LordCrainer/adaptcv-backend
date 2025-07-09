export interface ITranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  provider?: string
}

export interface ITranslationResponse {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  provider: string
  confidence?: number
}

export interface ITranslationStrategy {
  translate(request: ITranslationRequest): Promise<ITranslationResponse>
  getSupportedLanguages(): string[]
  getProviderName(): string
}

export interface ITranslationProvider {
  name: string
  apiKey?: string
  baseUrl?: string
  supportedLanguages: string[]
}
