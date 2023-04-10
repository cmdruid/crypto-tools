import * as Noble      from '@cmdcode/secp256k1'
import { Buff, Bytes } from '@cmdcode/buff-utils'
import { webcrypto as crypto } from '@cmdcode/webcrypto'

async function ecdh (
  secretKey : Bytes,
  sharedKey : Bytes
) : Promise<Uint8Array> {
  const secret = Buff.normalize(secretKey)
  const shared = Buff.normalize(sharedKey)
  return Noble.getSharedSecret(secret, shared, true)
}

async function importCryptoKey (key : Bytes) : Promise<CryptoKey> {
  /** Derive a shared key-pair and import as a
   *  CryptoKey object (for Webcrypto library).
   */
  const options : KeyAlgorithm = { name: 'AES-CBC' }
  const usage : KeyUsage[] = ['encrypt', 'decrypt']
  return crypto.subtle.importKey('raw', Buff.normalize(key), options, true, usage)
}

async function exportCryptoKey (
  key : CryptoKey
) : Promise<Uint8Array> {
  return crypto.subtle.exportKey('raw', key)
    .then(buff => new Uint8Array(buff))
}

async function importHmacKey (
  key : Bytes,
  fmt : string = 'SHA-256'
) : Promise<CryptoKey> {
  const config = { name: 'HMAC', hash: fmt }
  return crypto.subtle.importKey(
    'raw', Buff.normalize(key), config, false, ['sign', 'verify']
  )
}

async function generateCryptoKey () : Promise<CryptoKey> {
  return importCryptoKey(Buff.random(32))
}

async function normalizeCryptoKey (
  key : Bytes | CryptoKey
) : Promise<CryptoKey> {
  if (key instanceof CryptoKey) return key
  return KeyUtil.import(key)
}

async function getSharedCryptoKey (
  secretKey : Bytes,
  sharedKey : Bytes
) : Promise<CryptoKey> {
  const bytes = await ecdh(secretKey, sharedKey)
  return importCryptoKey(bytes.slice(1, 33))
}

export function getXOnlyPub (bytes : Bytes) : Buff {
  const b = Buff.bytes(bytes)
  if (b.length === 33) {
    return b.slice(1, 33)
  }
  if (b.length === 32) {
    return b
  }
  throw new Error('Invalid key length: ' + String(b.length))
}

export const KeyUtil = {
  ecdh,
  import    : importCryptoKey,
  export    : exportCryptoKey,
  hmac      : importHmacKey,
  shared    : getSharedCryptoKey,
  generate  : generateCryptoKey,
  normalize : normalizeCryptoKey
}
