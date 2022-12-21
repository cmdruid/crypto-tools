import { webcrypto as crypto } from 'crypto'
import * as Noble  from '@noble/secp256k1'
import { Buff }    from '@cmdcode/buff-utils'
import { KeyPair } from './ecc.js'

export async function importCryptoKey(raw: Uint8Array) : Promise<CryptoKey> {
  /** Derive a shared key-pair and import as a
   *  CryptoKey object (for Webcrypto library).
   */
  const options: KeyAlgorithm = { name: 'AES-CBC' }
  const usage: KeyUsage[] = ['encrypt', 'decrypt']
  return crypto.subtle.importKey('raw', raw, options, true, usage)
}

export async function exportCryptoKey(key : CryptoKey) : Promise<Uint8Array> {
  return crypto.subtle.exportKey('raw', key)
    .then(buff => new Uint8Array(buff))
}

export async function importHmacKey(
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

export async function genCryptoKey(): Promise<CryptoKey> {
  return importCryptoKey(Buff.random(32))
}

export function genKeyPair() : KeyPair {
  return new KeyPair(Buff.random(32))
}

export async function getSharedSecret(
  privKey : Uint8Array | CryptoKey,
  pubKey  : Uint8Array
) : Promise<Uint8Array> {
  if (privKey instanceof CryptoKey) {
    privKey = await exportCryptoKey(privKey)
  }
  return Noble.getSharedSecret(privKey, pubKey, true)
}

export async function getSharedKey(
  privKey : Uint8Array | CryptoKey,
  pubKey  : Uint8Array
) : Promise<CryptoKey> {
  const bytes = await getSharedSecret(privKey, pubKey)
  return importCryptoKey(bytes.slice(1,33))
}
