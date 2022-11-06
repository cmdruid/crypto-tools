import { webcrypto as crypto } from 'crypto'
import { getRandBytes } from './rand.js'

export async function importKey(raw: Uint8Array): Promise<CryptoKey> {
  /** Derive a shared key-pair and import as a
   *  CryptoKey object (for Webcrypto library).
   */
  const options: KeyAlgorithm = { name: 'AES-CBC' }
  const usage: KeyUsage[] = ['encrypt', 'decrypt']
  return crypto.subtle.importKey('raw', raw, options, true, usage)
}

export async function importHmac(
  key: Uint8Array,
  fmt: string = 'SHA-256'
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: fmt },
    false,
    ['sign', 'verify']
  )
}

export async function generateKey(): Promise<CryptoKey> {
  return importKey(getRandBytes(32))
}
