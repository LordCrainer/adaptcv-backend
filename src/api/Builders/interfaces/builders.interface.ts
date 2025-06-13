import type {
  IBuilder,
  RequestUserData
} from '@lordcrainer/adaptcv-shared-types'

import { Criteria } from '@src/Shared/utils/criteriaHandle'

export interface BuilderParams {
  body?: Partial<Omit<IBuilder, '_id'> & { builderId: string }>
  query?: Criteria<IBuilder>
  requestUser?: RequestUserData
}

export interface CreateBuilderPayload {
  body: Pick<IBuilder, 'name' | '_id'>
  requestUser?: RequestUserData
}
export type UpdateBuilderPayload = Partial<IBuilder> & {
  requestUser?: RequestUserData
}
