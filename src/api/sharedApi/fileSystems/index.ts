import * as fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Get __dirname equivalent for ES modules
 * @param importMetaUrl - The URL of the module
 * @returns The directory name as a string
 */
const getDirname = (importMetaUrl: string): string => {
  const _filename = fileURLToPath(importMetaUrl)
  return path.dirname(_filename)
}

/**
 * Get _filename equivalent for ES modules
 * @param importMetaUrl - The URL of the module
 * @returns The filename as a string
 */
const getFilename = (importMetaUrl: string): string => {
  return fileURLToPath(importMetaUrl)
}

/**
 * Create a readable stream from a file
 * @param path - The file path
 * @param options - Options for the read stream
 * @returns A promise that resolves to a ReadStream
 */
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

/**
 * Get file statistics
 * @param path - The file path
 * @param options - Options for the stat call
 * @returns The file statistics
 */
const getFileStats = async (
  path: fs.PathLike,
  options?: any | fs.BigIntOptions
): Promise<fs.Stats> => {
  try {
    return await fsPromises.stat(path, options)
  } catch (error) {
    throw new Error('ERROR_FS_STATSSYNC')
  }
}

/**
 * Check if a file exists
 * @param path - The file path
 * @param mode - The access mode
 * @returns An object containing the status and error (if any)
 */
const fileExists = async (path: fs.PathLike, mode?: number) => {
  try {
    await fsPromises.access(path, mode)
    return { status: true }
  } catch (err) {
    return { err, status: false }
  }
}

/**
 * Ensure a directory exists, creating it if necessary
 * @param dirPath - The directory path to ensure
 * @returns A promise that resolves when the directory is created or already exists
 */
const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fsPromises.mkdir(dirPath, { recursive: true })
  } catch (error: Error | any) {
    throw new Error(`Failed to create directory: ${error.message}`)
  }
}

/**
 * Read file with error handling
 * @param filePath - The file path
 * @param encoding - The file encoding
 * @returns The file contents
 */
const readFile = async (
  filePath: fs.PathLike,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> => {
  try {
    return await fsPromises.readFile(filePath, encoding)
  } catch (error: Error | any) {
    throw new Error(`Failed to read file: ${error.message}`)
  }
}

/**
 * Write data to a file, ensuring the directory exists
 * @param filePath - The file path
 * @param data - The data to write
 * @returns A promise that resolves when the file is written
 */
const writeFile = async (
  filePath: fs.PathLike,
  data: string
): Promise<void> => {
  try {
    const dir = path.dirname(filePath.toString())
    await ensureDir(dir)
    await fsPromises.writeFile(filePath, data, 'utf-8')
  } catch (error: Error | any) {
    throw new Error(`Failed to write file: ${error.message}`)
  }
}

export {
  createReadStream,
  getFileStats,
  fileExists,
  getDirname,
  getFilename,
  readFile,
  writeFile
}
