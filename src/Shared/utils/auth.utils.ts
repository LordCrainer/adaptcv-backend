export function getTokenExpirationInSeconds(expiresAt: number): number {
  return Math.floor((expiresAt - Date.now()) / 1000)
}
