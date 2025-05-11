import { describe, expect, it, test } from 'vitest'

import type { Criteria } from '@Shared/utils/criteriaHandle'

import { extractQueryFromCriteria } from '@Shared/utils/criteriaHandle'
import { decodeHash, encodeHash, generateHash } from '@Shared/utils/utilities'

describe('GenerateHash', () => {
  test('should generate a unique hash (1)', () => {
    const hash = generateHash('1')
    expect(hash).toBe('2f7bb230c70819aeb10b45a709bcf48f')
  })
  test('should generate a unique hash (2)', () => {
    const hash = generateHash('2')
    expect(hash).toBe('39c6844c921cf69656adaa2a8e4aea0c')
  })
  test('should generate array hash', () => {
    const hashes = new Array(10)
      .fill('')
      .map((v, index) => generateHash({ name: `${index + 1}` }, { max: 16 }))
    expect(hashes).toStrictEqual([
      'ad567e5f238e80f0',
      '705e9e9cdf44f1a8',
      '301fd260f0960f5b',
      'f3d6abc698b9f064',
      '6cab65fb327d450f',
      '4d13bbb5707703c9',
      'eb64532ed10d79ef',
      '238807e459aeb11f',
      '5139cffa37eca1fe',
      'e3876712d48f65de'
    ])
  })
  test('should generate hash with sha256', () => {
    const hash = encodeHash('11,100')
    expect(hash).toStrictEqual('MTEsMTAwICAgICAg')
  })
  test('should decode hash with sha256', () => {
    const dehash = decodeHash('MTEsMTAwICAgICAg')
    expect(dehash).toStrictEqual('11,100      ')
  })
})

describe('buildOrFromCriteria function', () => {
  const provider = 'mongo' // o 'mysql' dependiendo de tu caso
  const builderQuery = extractQueryFromCriteria(provider)

  it('should return correct filters structure', () => {
    const query: Partial<Criteria> = {
      filters: {
        name__like: 'John',
        age__gte: 10,
        age__lte: 50,
        createdAt__gte: new Date('2022-09-01T19:17:00.000Z'),
        updatedAt__gte: new Date('2023'),
        deletedAt: new Date('2024'),
        title: 'John',
        'metadata.title__like': 'John'
      }
    }
    const result = builderQuery(query)
    expect(result).toBeDefined()
    expect(result.filters).toBeDefined()
    expect(result.filters).toEqual({
      name: { $regex: /John/i },
      age: { $gte: 10, $lte: 50 },
      createdAt: { $gte: new Date('2022-09-01T19:17:00.000Z') },
      updatedAt: { $gte: new Date('2023') },
      deletedAt: new Date('2024'),
      title: 'John',
      'metadata.title': { $regex: /John/i }
    })
  })
  it('should return correct or structure', () => {
    const query: Partial<Criteria> = {
      or: [
        { name__like: 'John' },
        { age__gte: 10 },
        { age__lte: 50 },
        { createdAt__gte: '2022-09-01T19:17:00.000Z' },
        { updatedAt__gte: '2023' },
        { deletedAt: '2024' },
        { title: 'John' },
        { 'metadata.title__like': 'John' }
      ]
    }
    const result = builderQuery(query)
    expect(result).toBeDefined()
    expect(result.or).toBeDefined()
    expect(result.or).toEqual({
      $or: [
        { name: { $regex: /John/i } },
        { age: { $gte: 10 } },
        { age: { $lte: 50 } },
        { createdAt: { $gte: new Date('2022-09-01T19:17:00.000Z') } },
        { updatedAt: { $gte: new Date('2023') } },
        { deletedAt: new Date('2024') },
        { title: 'John' },
        { 'metadata.title': { $regex: /John/i } }
      ]
    })
  })
})
