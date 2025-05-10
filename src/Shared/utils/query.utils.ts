import { Criteria } from './criteriaHandle'

const convertionToRealType = (value: string) => {
  if (value === '' || value === '""' || value.length === 0) {
    return
  }
  return value
}

export function parseQueryParamsToCriteria(query: any): Partial<Criteria> {
  const criteria: Partial<Criteria> = {}
  const { filters, select, or, 'order-by': orderBy, ...otherQueries } = query

  if (orderBy) {
    criteria.orderBy = buildOrderBy(query['order-by'])
  }
  if (filters) {
    criteria.filters = buildFilters(query.filters)
  }
  if (select) {
    criteria.select = buildSelect(query.select)
  }
  if (or) {
    criteria.or = buildOrs(query.or)
  }
  return {
    ...otherQueries,
    ...criteria,
    page: parseInt(query.page, 10) || 1,
    limit: parseInt(query.limit, 10) || 100
  }
}

function buildSelect(select: string): Partial<Criteria['select']> {
  const selects: string[] =
    typeof select === 'string' ? select.split('&') : select
  if (selects.length === 0) {
    return undefined
  }
  return selects.reduce(
    (acc: Partial<Criteria['select']> = {}, select: string) => {
      const [field, value] = select.split('=')
      if (!field || !value) {
        return acc
      }
      const numValue = +value
      if (numValue === 0 || numValue === 1) {
        acc[field] = numValue
      }
      return acc
    },
    {}
  )
}
function buildOrderBy(orderBy: string): Partial<Criteria['orderBy']> {
  const orders: string[] =
    typeof orderBy === 'string' ? orderBy.split('&') : orderBy
  if (orders.length === 0) {
    return undefined
  }
  return orders.reduce(
    (acc: Partial<Criteria['orderBy']> = {}, order: string) => {
      const [field, direction] = order.split('=') || []
      if (!field || !direction) {
        return acc
      }
      acc[field] = direction as Criteria['orderBy'][keyof Criteria['orderBy']]
      return acc
    },
    {}
  )
}

function buildFilters(filters: string): Partial<Criteria['filters']> {
  const filtersArray: string[] =
    typeof filters === 'string' ? filters.split('&') : filters
  if (filtersArray.length === 0) {
    return undefined
  }
  return filtersArray.reduce(
    (acc: Partial<Criteria['filters']> = {}, filter: string) => {
      const [prop, value] = filter.split('=')
      const realValue = convertionToRealType(value)
      acc[prop] = realValue
      return acc
    },
    {}
  )
}

function buildOrs(ors: string): Criteria['or'] {
  const orsArray: string[] = typeof ors === 'string' ? ors.split('&') : ors
  if (orsArray.length === 0) {
    return []
  }
  return orsArray
    .map((or: string) => {
      const [prop, value] = or.split('=') || []
      if (!prop || !value) {
        return null
      }
      const realValue = convertionToRealType(value)
      return { [prop]: realValue }
    })
    .filter(
      (item): item is { [key: string]: string | undefined } => item !== null
    )
}
