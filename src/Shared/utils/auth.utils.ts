export function getTokenExpirationInSeconds(expiresAt: number): number {
  return Math.floor((expiresAt * 1000 - Date.now()) / 1000)
}
