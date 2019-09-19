import { inputObjectType } from 'nexus'

export const ImageInput = inputObjectType({
  name: 'ImageInput',
  definition (t) {
    t.string('entityId')
    t.field('file', { type: 'Upload', nullable: true })
  }
})