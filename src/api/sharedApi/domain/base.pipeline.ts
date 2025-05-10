import { QueryFromCriteria } from '@Shared/utils/criteriaHandle'

export function buildSortPipeline(queries?: QueryFromCriteria) {
  if (queries?.orderBy != null) {
    return [{ $sort: queries.orderBy }]
  }
  return []
}

export function buildPaginationPipeline(queries?: QueryFromCriteria) {
  if (queries?.page && queries?.limit) {
    return [
      {
        $skip: (queries?.page - 1) * queries?.limit
      },
      {
        $limit: queries?.limit
      }
    ]
  }
  return []
}
