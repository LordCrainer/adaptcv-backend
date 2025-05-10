type CriteriaField<T extends string> = `${T}__${keyof OperationsDb}`

type CriteriaFilter<T> = {
  [key in
    | keyof T
    | CriteriaField<keyof RecursivePartialWithDotNotation<T> & string>]?:
    | T[keyof T]
    | number
    | string
    | Array<number | string>
    | RecursivePartialWithDotNotation<T[keyof T]>
}

type FieldMap<T, K = any> = {
  [key in keyof T]?: K
}

export interface Criteria<T = any> {
  page?: number
  limit?: number
  orderBy?: FieldMap<T, 'asc' | 'desc'>
  filters?: CriteriaFilter<T>
  select?: FieldMap<T, 0 | 1>
  or?: CriteriaFilter<T>[]
  lookup?: string
}

export interface OperationsDb {
  equals: string
  eq: string
  gte: string
  lte: string
  like: string
  in: string
  notIn: string
  between: string
  contains: string
  gt: string
  lt: string
  startWith: string
  endWith: string
  asc: number | string
  desc: number | string
  exists: string
  ne: string
}

export interface providersDb {
  mongo: Partial<OperationsDb>
  mysql: Partial<OperationsDb>
}
const dbProviderOperation = <providersDb>{
  mongo: {
    equals: '$eq',
    gte: '$gte',
    lte: '$lte',
    like: '$regex',
    in: '$in',
    asc: 1,
    desc: -1,
    exists: '$exists',
    ne: '$ne'
  },
  mysql: {
    equals: '=',
    gte: '>=',
    lte: '<=',
    like: 'LIKE',
    in: 'IN',
    asc: 'ASC',
    desc: 'DESC'
  }
}

const operationsMap: Record<string, keyof OperationsDb> = {
  eq: 'eq',
  lt: 'lt',
  lte: 'lte',
  gt: 'gt',
  gte: 'gte'
}

export interface QueryFromCriteria<T = any> {
  limit?: number
  page?: number
  skip?: number
  orderBy?: Record<string, any>
  filters?: Partial<Record<keyof T, any>>
  select?: Partial<Record<keyof T, number>>
  or?: { $or: Partial<Record<string, any>>[] }
  populate?: string | any
  lookup?: string
  [key: string]: T[keyof T] | any
}

export const extractQueryFromCriteria =
  <T = any>(provider: keyof providersDb) =>
  (criteria?: Partial<Criteria<T>>): QueryFromCriteria<T> => {
    let {
      filters,
      select,
      or,
      orderBy,
      limit = 100,
      page = 1,
      lookup,
      ...others
    } = criteria || {}
    if (filters) {
      filters = buildFiltersFromCriteria(filters, provider)
    }
    return {
      limit: limit,
      page: page,
      skip: (page - 1) * limit,
      filters,
      ...(orderBy && { orderBy: buildOrderByFromCriteria(orderBy, provider) }),
      ...(select && { select: buildSelectFromCriteria(select) }),
      ...(or && { or: buildOrFromCriteria(or, provider) }),
      ...(lookup && { lookup: lookup }),
      ...others
    }
  }

function buildBaseFromCriteria<T = any>(
  criteria: [string, any],
  provider: keyof providersDb
) {
  const [key, value] = criteria
  const [field, operation = undefined] = key.split('__')

  const isIdField = /^(id|_id|.*id)$/.test(field)

  let newValue = value

  if (['createdAt', 'updatedAt', 'deletedAt'].includes(field)) {
    newValue = new Date(`${value}`)
  }

  const returnValue = () => {
    if (newValue?.toString() === 'Invalid Date') {
      return null
    }

    if (operation) {
      const evaluatedOperation =
        dbProviderOperation[provider][operation as keyof OperationsDb]
      if (!evaluatedOperation) {
        return newValue
      }

      return {
        [evaluatedOperation]:
          operation === 'like' ? new RegExp(newValue, 'i') : newValue
      }
    }

    if (newValue instanceof Date) {
      return buildDateOperation(provider, newValue, operation)
    }

    if (isIdField) {
      return newValue
    }

    if (!isNaN(newValue)) {
      return +newValue
    }

    return newValue
  }

  return {
    field,
    value: returnValue()
  }
}

function buildDateOperation(
  provider: keyof providersDb,
  value: Date,
  operation?: string
) {
  if (!operation) {
    return value
  }

  const evaluatedOperation =
    dbProviderOperation[provider][operationsMap[operation as string]]
  return evaluatedOperation ? { [evaluatedOperation]: value } : undefined
}

function buildSelectFromCriteria<T extends any>(select: Criteria['select']) {
  if (!select) {
    return undefined
  }
  return Object.entries(select).reduce(
    (acc, [field, value]) => {
      if (!value) {
        return acc
      }
      acc[field] = value
      return acc
    },
    {} as Record<string, number>
  ) as Record<keyof T, number>
}

function buildOrderByFromCriteria(
  orderBy: Partial<Criteria['orderBy']>,
  provider: keyof providersDb = 'mongo'
) {
  if (!orderBy) {
    return
  }
  return Object.entries(orderBy).reduce(
    (acc, [field, value]) => {
      if (!value) {
        return acc
      }
      const operationValue = dbProviderOperation[provider][value]
      if (operationValue !== undefined) {
        acc[field] = operationValue
      }
      return acc
    },
    {} as Record<string, number | string>
  )
}

function buildOrFromCriteria(
  ors: Partial<Criteria['or']>,
  provider: keyof providersDb
) {
  if (!ors?.length) {
    return undefined
  }

  return {
    $or: ors
      .filter((p) => !!p)
      .map((params) => {
        const entry = Object.entries(params)[0]
        const { field, value } = buildBaseFromCriteria(entry, provider)
        return { [field]: value }
      })
  }
}

function buildFiltersFromCriteria(
  filters: Partial<Criteria['filters']>,
  provider: keyof providersDb
) {
  if (!filters) {
    return undefined
  }
  const entriesFilters = Object.entries(filters)
  if (!entriesFilters.length) {
    return
  }

  return entriesFilters.reduce(
    (acc: Record<string, any>, curr) => {
      const { field, value: newValue } = buildBaseFromCriteria(curr, provider)
      if (
        typeof newValue === 'object' &&
        !Array.isArray(newValue) &&
        !(newValue instanceof Date)
      ) {
        acc[field] = { ...acc[field], ...newValue }
      } else {
        acc[field] = newValue
      }

      return acc
    },
    {} as Record<string, any>
  )
}
