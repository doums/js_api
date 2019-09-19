import { Context } from './types'
import { ApolloError } from 'apollo-server'
import * as stream from 'stream'
import * as fs from 'fs'
import { generate } from 'shortid'
import * as path from 'path'
import { HOST_IMAGE, UPLOAD_DIR } from './constant'
import { ImageInput } from './resolvers/ImageInput'

export function sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const storeFS = (readStream: stream.Readable, path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path)
    writeStream.on('error', error => {
      writeStream.destroy()
      fs.unlinkSync(path)
      reject(error)
    })
    readStream
      .on('error', error => {
        fs.unlinkSync(path)
        writeStream.destroy()
        reject(error)
      })
      .pipe(writeStream)
      .on('finish', () => resolve())
  })
}

interface ImageInput {
  entityId: string;
  file?: any; // Upload
}

const normalizeEntityMap = async (ctx: Context, postId: string): Promise<void> => {
  const { body, body: { entityMap } } = await ctx.prisma.post({ id: postId })
  const images = await ctx.prisma.post({ id: postId }).images()
  if (!images && !entityMap) {
    return
  }
  for (const entityKey of Object.keys(entityMap)) {
    const { type, data } = entityMap[entityKey]
    if (type === 'IMAGE') {
      const image = images.find(img => img.entityId === data.id)
      if (!image) {
        throw new ApolloError(`normalizeEntityMap: no corresponding image for the entity with id "${data.id}"`, 'UPLOAD_ERROR')
      }
      entityMap[entityKey].data.src = image.url
    }
  }
  body.entityMap = entityMap
  await ctx.prisma.updatePost({
    where: { id: postId },
    data: { body }
  })
}

export const processImages = async (ctx: Context, postId: string, imagesQuery: ImageInput[]): Promise<void> => {
  const existingImages = await ctx.prisma
    .post({ id: postId })
    .images()
  // upload, save to disk and db new images
  for (const { entityId, file } of imagesQuery) {
    if (!existingImages.find(img => img.entityId === entityId)) {
      if (!file) {
        throw new ApolloError('no file provided', 'UPLOAD_ERROR')
      }
      const { createReadStream, mimetype } = await file
      if (!mimetype.startsWith('image/')) {
        throw new ApolloError('images only!', 'UPLOAD_ERROR')
      }
      const extension = `${mimetype.slice(6)}`
      const imageName = `${generate()}.${extension}`
      const filePath = path.join(UPLOAD_DIR, imageName)
      try {
        await storeFS(createReadStream(), filePath)
      } catch (e) {
        console.log(e)
        throw new ApolloError('error occurred while uploading the image', 'UPLOAD_ERROR')
      }
      await ctx.prisma.createImage({
        path: filePath,
        fileName: imageName,
        type: extension,
        url: `${HOST_IMAGE}/${imageName}`,
        entityId,
        post: {
          connect: { id: postId }
        }
      })
    }
  }
  // remove from disk and db unused images
  for (const { id, entityId, path } of existingImages) {
    if (!imagesQuery.find(img => img.entityId === entityId)) {
      try {
        fs.unlinkSync(path)
      } catch (e) {
        console.log(e.message)
      }
      await ctx.prisma.deleteImage({ id })
    }
  }
  await normalizeEntityMap(ctx, postId)
}

export const removeImagesFromDisk = async (ctx: Context, postId: string): Promise<void> => {
  const images = await ctx.prisma
    .post({ id: postId })
    .images()
  images.forEach(image => {
    try {
      fs.unlinkSync(image.path)
    } catch (e) {
      console.log(e.message)
    }
  })
}