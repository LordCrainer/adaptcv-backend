export interface ITranslationRequest {
  text: string
  to: string
  from: string
}

export interface ITranslationResponse {
  translatedText: string
  characterLength?: number
}

export type TranslationProviderName = 'lecto' | 'emulator'

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
