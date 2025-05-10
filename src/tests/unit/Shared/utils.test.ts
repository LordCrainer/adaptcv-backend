import { describe, expect, it } from 'vitest'

import { parseQueryParamsToCriteria } from '@Shared/utils/query.utils'

describe('query.utils', () => {
  it('should map filters to criteria correctly', () => {
    const filters = ['name__equals=John', 'age__gte=30']
    const expected = { name__equals: 'John', age__gte: '30' }
    expect(parseQueryParamsToCriteria({ filters }).filters).toEqual(expected)
  })
  it('should return orderBy and filters criteria', () => {
    const queries = {
      'order-by': 'name=asc',
      filters: ['name__equals=John', 'age__gte=30']
    }
    const expected = {
      orderBy: { name: 'asc' },
      filters: { name__equals: 'John', age__gte: '30' },
      limit: 100,
      page: 1
    }
    const result = parseQueryParamsToCriteria(queries)
    expect(result).toEqual(expected)
  })
})
