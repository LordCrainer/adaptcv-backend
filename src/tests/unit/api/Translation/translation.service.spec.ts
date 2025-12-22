import { describe, expect, it, vi } from 'vitest'

import {
  ITranslationRequest,
  ITranslationResponse,
  ITranslationStrategy
} from '@Api/Translation/interfaces/translation.interface'
import { TranslationService } from '@Api/Translation/translation.service'

class MockStrategy implements ITranslationStrategy {
  getSupportedLanguages() {
    return ['en', 'es']
  }
  getProviderName() {
    return 'mock'
  }
  async translate(request: ITranslationRequest): Promise<ITranslationResponse> {
    return { translatedText: `mock:${request.text}` }
  }
}

describe('TranslationService', () => {
  it('should use the mock strategy when provider is mock', async () => {
    // @ts-ignore: override for test
    TranslationService.prototype.providers = { mock: new MockStrategy() }
    const service = new TranslationService('emulator')
    const result = await service.translate({
      text: 'hello',
      to: 'es',
      from: 'en'
    })
    expect(result.translatedText).toBe('mock:hello')
  })

  it('should throw if provider does not exist', async () => {
    // @ts-ignore: override for test
    TranslationService.prototype.providers = {}
    const service = new TranslationService('emulator')
    await expect(
      service.translate({ text: 'hi', to: 'es', from: 'en' })
    ).rejects.toThrow('Translation provider not supported')
  })
})
