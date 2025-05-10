import crypto from 'crypto'

export type MapType<Type> = {
  [key in keyof Type]: Type[key]
}

export function generateHash(
  data: string | Record<string, unknown>,
  options?: Partial<{ min: number; max: number; hashType: string }>
): string {
  const { min = 0, max, hashType = 'md5' } = options || {}
  const dataString = JSON.stringify(data)
  const prehash = crypto.createHash(hashType).update(dataString).digest('hex')
  const hash = prehash.slice(min, max ?? prehash.length)
  return hash
}

export const decodeHash = (hash: string) => {
  return Buffer.from(hash, 'base64url').toString('utf-8')
}

export function encodeHash(
  data: number | string | Record<string, unknown>
): string {
  if (!data) return ''
  let dataString =
    typeof data === 'string' || typeof data === 'number'
      ? `${data}`
      : JSON.stringify(data)

  if (dataString.length < 16 && typeof data !== 'object') {
    dataString = dataString.padEnd(12, ' ')
  }
  // return dataString.trim()
  return Buffer.from(dataString).toString('base64url')
}
