import * as fs from 'fs'

/**
 * PROGRESS EVENT FOR STREAM DATA
 * @param {NodeJS.ReadableStream | Buffer} inputStream
 * @param {Number} size
 * @param {function(Number):Number} callback - progress: number
 */
const progressEvent = async (
  inputStream: fs.ReadStream,
  size: number,
  callback: (d: number | string) => number
): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    let uploadedSize = 0
    inputStream.on('data', (buffer) => {
      const segmentLength = buffer.length
      uploadedSize += segmentLength
      const progress = ((uploadedSize / size) * 100).toFixed(2)
      callback(+progress)
    })
    resolve(true)
  })

export default {
  progressEvent
}
