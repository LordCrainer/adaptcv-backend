import type { IBuilder } from '@lordcrainer/adaptcv-shared-types'

import { BaseRepository } from '@src/Shared/utils/base.repository'
import { BuilderModel } from './repository/builders.schema'

export class BuilderRepository extends BaseRepository<IBuilder> {
  constructor() {
    super(BuilderModel, 'mongo')
  }
}
