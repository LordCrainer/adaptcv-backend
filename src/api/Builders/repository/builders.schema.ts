import { model, Schema } from 'mongoose'

import type { IBuilder } from '@lordcrainer/adaptcv-shared-types'

const CVSchema = new Schema<IBuilder>(
  {
    _id: { type: String, required: true },
    createdBy: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    aboutMe: { type: Object, required: false },
    education: { type: [Object], required: false },
    workExperience: { type: [Object], required: false },
    userProfile: { type: Object, required: false },
    skills: { type: [Object], required: false },
    languages: { type: [Object], required: false },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published'],
      default: 'draft'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export const BuilderModel = model<IBuilder>('Builder', CVSchema)
