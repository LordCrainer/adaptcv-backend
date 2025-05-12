import type {
  Builder,
  RequestUserData
} from '@lordcrainer/adaptcv-shared-types'

import { Criteria } from '@src/Shared/utils/criteriaHandle'

export interface BuilderParams extends Omit<Builder, '_id'>, Criteria<Builder> {
  builderId: string
  requestUser?: RequestUserData
}

export interface CreateBuilderPayload {
  body: Pick<Builder, 'name' | '_id'>
  requestUser?: RequestUserData
}
export type UpdateBuilderPayload = Partial<Builder> & {
  requestUser?: RequestUserData
}
