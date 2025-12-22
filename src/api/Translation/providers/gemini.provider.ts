import { GoogleGenAI } from '@google/genai'

import {
  ITranslationRequest,
  ITranslationResponse,
  ITranslationStrategy
} from '@Api/Translation/interfaces/translation.interface'

type GeminiModels = 'gemma-3n-e2b-it' | 'gemma-3.5-flash' | 'gemini-2.5-flash'

export class GeminiTranslationStrategy implements ITranslationStrategy {
  private ai: GoogleGenAI
  private model: GeminiModels

  constructor(apiKey: string, model: GeminiModels = 'gemma-3n-e2b-it') {
    this.ai = new GoogleGenAI({ apiKey })
    this.model = model
  }

  async translate(request: ITranslationRequest): Promise<ITranslationResponse> {
    const { to: targetLanguage, from: sourceLanguage, texts } = request
    if (!texts) {
      throw new Error('No text or JSON provided for translation')
    }
    let prompt: string = ''
    const isTextArray = Array.isArray(texts) && texts.length > 0

    if (isTextArray) {
      prompt = this.promptTranslationTexts(
        texts as string[],
        sourceLanguage,
        targetLanguage
      )
    } else {
      prompt = this.promptTranslationJson(
        texts as string,
        sourceLanguage,
        targetLanguage
      )
    }

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt
    })
    const translatedText = this.cleanJson(response.text ?? '')
    return {
      translatedText,
      isJson: !!translatedText,
      characterLength: response.usageMetadata?.candidatesTokenCount
    }
  }

  private promptTranslationJson(
    texts: string,
    sourceLanguage: string,
    targetLanguage: string
  ) {
    return `Tienes un objeto JSON que representa una sección de un currículum vitae.
  Tu tarea es traducir **ÚNICAMENTE LOS VALORES** de este JSON de ${this.selectedLanguages[sourceLanguage].es} a ${this.selectedLanguages[targetLanguage].es}.
  DEBES mantener los nombres de las **claves (keys) JSON exactamente iguales**, sin alterarlas, añadir ni eliminar ninguna.
  DEBES devolver la respuesta como un objeto JSON **VÁLIDO Y COMPLETO**, manteniendo la misma estructura y el mismo orden de claves.
  Asegúrate de que la traducción sea precisa, formal y profesional, adecuada para un CV.
  No añadas ninguna otra explicación, texto introductorio, ni texto fuera del JSON final, ni un json o caracteres que no estaban en el texto.

  Objeto JSON a traducir:
  ${texts}

  Objecto json traducido:`
  }

  private cleanJson(json: string): string {
    return json.replace(/(\`+)|(json\n)/g, '').trim()
  }

  private promptTranslationTexts(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ) {
    const textToTranslate = texts.join('\n')
    return `Traduce el siguiente texto de ${sourceLanguage} a ${targetLanguage}. 
  Asegúrate de que la traducción sea precisa y fluida, manteniendo el contexto original.
  
  Texto a traducir:
  "${textToTranslate}"
  
  Traducción:`
  }

  private selectedLanguages: Record<string, { es: string }> = {
    es: { es: 'Español' },
    en: { es: 'Inglés' },
    fr: { es: 'Francés' },
    de: { es: 'Alemán' },
    it: { es: 'Italiano' },
    pt: { es: 'Portugués' },
    zh: { es: 'Chino' },
    ja: { es: 'Japonés' },
    ko: { es: 'Coreano' }
  }

  getSupportedLanguages(): string[] {
    return ['en', 'es', 'fr', 'de', 'it', 'pt']
  }

  getProviderName(): string {
    return 'gemini'
  }
}
