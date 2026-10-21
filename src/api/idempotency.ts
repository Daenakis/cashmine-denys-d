// Idempotency keys must be unique per claim attempt. crypto.randomUUID needs a
// secure context (https / localhost), so fall back to getRandomValues.
export function createIdempotencyKey(): string {
  const cryptoApi: Crypto = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();

  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex: string = Array.from(bytes, (byte: number): string => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
