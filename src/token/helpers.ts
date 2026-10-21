export function maskToken(token: string): string {
  return token.length <= 4 ? '••••' : `••••${token.slice(-4)}`;
}
