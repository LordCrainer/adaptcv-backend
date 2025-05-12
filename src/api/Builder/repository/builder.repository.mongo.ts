import type { Builder } from '@lordcrainer/adaptcv-shared-types'

import { BaseRepository } from '@src/Shared/utils/base.repository'
import { BuilderModel } from './builder.schema'

export class BuilderRepositoryMongo extends BaseRepository<Builder> {
  constructor() {
    super(BuilderModel, 'mongo')
  }
}
