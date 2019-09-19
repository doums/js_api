import * as path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export const PORT = 4000
export const UPLOAD_DIR = isDev ? path.join(__dirname, '../upload') : '/srv/http/uploads'
export const HOST_IMAGE = isDev ? 'http://localhost' : 'https://image.petitmur.beer'