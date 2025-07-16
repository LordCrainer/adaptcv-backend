export interface ITranslationRequest {
  texts: string | string[]
  to: string
  from: string
}

export interface ITranslationResponse {
  translatedText: string,
  isJson?: boolean
  characterLength?: number
}

export type TranslationProviderName = 'lecto' | 'emulator' | 'gemini'

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
