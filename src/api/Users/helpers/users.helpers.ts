import bcrypt from 'bcrypt'

import currentEnv from '@src/config/environments'

const SALT_ROUNDS = currentEnv.bcryptSaltRounds ?? 10

export const checkPasswordHash = async function (
  password: string,
  passwordHash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, passwordHash)
  } catch (error) {
    return false
  }
}

export const generatePasswordHash = async function (
  password: string
): Promise<string> {
  const salt: string = await bcrypt.genSalt(SALT_ROUNDS)
  const hash: string = await bcrypt.hash(password, salt)
  return hash
}
