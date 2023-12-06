import { Buff, Bytes } from '@cmdcode/buff'
import { CipherType }  from '../types.js'

if (
  typeof globalThis === 'undefined'        ||
  typeof globalThis.crypto === 'undefined' ||
  typeof globalThis.crypto.subtle === 'undefined'
) {
  throw new Error(
`globalThis.crypto is missing from your environment!

If using NodeJS, make sure you are running v19 and above.

If using a browser, make sure you are using an updated version.

If your browser is up-to-date, make sure you are using 'https://', 
or if developing locally, use 'http://127.0.0.1' instead of localhost.`
  )
}

// Attempt to import the crypto library from somewhere.
const { subtle } = globalThis?.crypto ?? crypto ?? window?.crypto

if (
  typeof subtle === 'undefined'  ||
  subtle.importKey === undefined ||
  subtle.encrypt   === undefined ||
  subtle.decrypt   === undefined
) {
  throw new Error('Subtle crypto library not found on this device!')
}

async function import_key (
  secret : Bytes,
  type   : CipherType = 'AES-GCM'
) {
  /** Derive a CryptoKey object (for Webcrypto library). */
  const key     = Buff.bytes(secret)
  const options = { name: type }
  const usage   = [ 'encrypt', 'decrypt' ] as KeyUsage[]
  return subtle.importKey('raw', key, options, true, usage)
}

export async function encrypt (
  secret  : Bytes,
  payload : Bytes,
  vector  : Bytes = Buff.random(32),
  type    : CipherType = 'AES-GCM'
) {
  const key = await import_key(secret)
  const msg = Buff.bytes(payload)
  const iv  = Buff.bytes(vector)
  const opt = { name: type, iv }
  const enc = await subtle.encrypt(opt, key, msg)
  return { data: Buff.bytes(enc), iv }
}

export async function decrypt (
  secret  : Bytes,
  payload : Bytes,
  vector  : Bytes,
  type    : CipherType = 'AES-GCM'
) {
  const key = await import_key(secret)
  const msg = Buff.bytes(payload)
  const iv  = Buff.bytes(vector)
  const opt = { name: type, iv }
  return subtle.decrypt(opt, key, msg)
    .then(decoded => Buff.bytes(decoded))
}
