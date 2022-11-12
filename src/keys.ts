import { webcrypto as crypto } from 'crypto'
import { getRandBytes } from './rand.js'
import { Noble } from './ecc.js'

export async function importKey(raw: Uint8Array) : Promise<CryptoKey> {
  /** Derive a shared key-pair and import as a
   *  CryptoKey object (for Webcrypto library).
   */
  const options: KeyAlgorithm = { name: 'AES-CBC' }
  const usage: KeyUsage[] = ['encrypt', 'decrypt']
  return crypto.subtle.importKey('raw', raw, options, true, usage)
}

export async function exportKey(key : CryptoKey) : Promise<Uint8Array> {
  return crypto.subtle.exportKey('raw', key)
    .then(buff => new Uint8Array(buff))
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

export async function getSharedKey(
  privKey : Uint8Array | CryptoKey,
  pubKey  : Uint8Array
) : Promise<CryptoKey> {
  privKey = (privKey instanceof CryptoKey) 
    ? await exportKey(privKey) 
    : privKey
  return importKey(Noble.getSharedSecret(privKey, pubKey))
}
