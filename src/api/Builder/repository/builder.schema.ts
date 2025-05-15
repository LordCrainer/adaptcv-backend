import { Builder } from '@lordcrainer/adaptcv-shared-types'
import { model, Schema } from 'mongoose'

const CVSchema = new Schema<Builder>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    aboutMe: { type: Object, required: false },
    education: { type: [Object], required: false },
    workExperience: { type: [Object], required: false },
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
    timestamps: true
  }
)

export const BuilderModel = model<Builder>('Builder', CVSchema)
