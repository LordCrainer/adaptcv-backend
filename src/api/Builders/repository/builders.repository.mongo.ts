import type { IBuilder } from '@lordcrainer/adaptcv-shared-types'

import { BaseRepository } from '@src/Shared/utils/base.repository'
import { BuilderModel } from './builders.schema'

export class BuilderRepositoryMongo extends BaseRepository<IBuilder> {
  constructor() {
    super(BuilderModel, 'mongo')
  }
}
