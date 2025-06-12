import { describe, expect, it } from 'vitest'

import {
  checkPasswordHash,
  generatePasswordHash
} from '@src/api/Users/helpers/users.helpers'

describe('users.helpers', () => {
  it('debe generar un hash y validarlo correctamente', async () => {
    const password = 'Password.123'
    const hash = await generatePasswordHash(password)
    expect(hash).toBeTypeOf('string')
    expect(hash).not.toBe(password)
    const isValid = await checkPasswordHash(password, hash)
    expect(isValid).toBe(true)
  })

  it('debe fallar si el password es incorrecto', async () => {
    const password = 'Password.123'
    const wrongPassword = 'Password.321'
    const hash = await generatePasswordHash(password)
    const isValid = await checkPasswordHash(wrongPassword, hash)
    expect(isValid).toBe(false)
  })

  it('debe devolver false si el hash es inválido', async () => {
    const password = 'Password.123'
    const isValid = await checkPasswordHash(password, 'not-a-real-hash')
    expect(isValid).toBe(false)
  })
})
