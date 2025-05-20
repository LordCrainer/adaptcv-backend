import type { IBuilder } from '@lordcrainer/adaptcv-shared-types'

import { BaseRepository } from '@src/Shared/utils/base.repository'
import { BuilderModel } from './repository/builder.schema'

export class BuilderRepository extends BaseRepository<Builder> {
  constructor() {
    super(BuilderModel, 'mongo')
  }
}
