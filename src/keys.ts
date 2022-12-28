import * as Noble      from '@noble/secp256k1'
import { Buff, Bytes } from '@cmdcode/buff-utils'

export async function ecdh(
  secretKey : Bytes,
  sharedKey : Bytes
) : Promise<Uint8Array> {
  const secret = Buff.normalizeBytes(secretKey)
  const shared = Buff.normalizeBytes(sharedKey)
  return Noble.getSharedSecret(secret, shared, true)
}

async function importCryptoKey(raw: Uint8Array) : Promise<CryptoKey> {
  /** Derive a shared key-pair and import as a
   *  CryptoKey object (for Webcrypto library).
   */
  const options: KeyAlgorithm = { name: 'AES-CBC' }
  const usage: KeyUsage[] = ['encrypt', 'decrypt']
  return crypto.subtle.importKey('raw', raw, options, true, usage)
}

async function exportCryptoKey(key : CryptoKey) : Promise<Uint8Array> {
  return crypto.subtle.exportKey('raw', key)
    .then(buff => new Uint8Array(buff))
}

async function importHmacKey(
  key: Uint8Array,
  fmt: string = 'SHA-256'
): Promise<CryptoKey> {
  const config = { name: 'HMAC', hash: fmt }
  return crypto.subtle.importKey(
    'raw', key, config, false, ['sign', 'verify']
  )
}

async function generateCryptoKey(): Promise<CryptoKey> {
  return importCryptoKey(Buff.random(32))
}

async function getSharedCryptoKey(
  secretKey : Bytes,
  sharedKey : Bytes
) : Promise<CryptoKey> {
  const bytes = await ecdh(secretKey, sharedKey)
  return importCryptoKey(bytes.slice(1,33))
}

export const KeyImport = {
  crypto   : importCryptoKey,
  hmac     : importHmacKey,
  shared   : getSharedCryptoKey,
  generate : generateCryptoKey
}

export const KeyExport = {
  crypto : exportCryptoKey
}
