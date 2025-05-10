import { promises as fsPromises } from 'fs'
import * as fs from 'fs'

const createReadStream = async (
  path: fs.PathLike,
  options?: object
): Promise<fs.ReadStream> => {
  return await new Promise((resolve, reject) => {
    const streamFile = fs
      .createReadStream(path, options)
      .on('error', (err: Error) => {
        // error(`ERROR_MISCELANEAS_FS_CREATEREADSTREAM: ${err.code}${err.path}\n`);
        reject({ message: err.message })
      })
    resolve(streamFile)
  })
}

const statSync = async (
  path: fs.PathLike,
  options?: any | fs.BigIntOptions
): Promise<fs.BigIntStats> => {
  return await new Promise((resolve, reject) => {
    const stats = fs.statSync(path, options)
    if (Object.keys(stats).length === 0 && stats.constructor === Object) {
      reject(new Error('ERROR_FS_STATSNC'))
    }
    resolve(stats as any)
  })
}

const existFile = async (path: fs.PathLike, mode?: number) => {
  let result, status
  try {
    result = await fsPromises.access(path, mode)
    return { status: true }
  } catch (err) {
    return { err, status: false }
  }
}

export default {
  createReadStream,
  statSync,
  existFile
}
