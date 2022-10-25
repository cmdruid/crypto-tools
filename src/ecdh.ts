import { webcrypto as crypto } from 'crypto'
import { sha256 } from './hash'

const ec = new TextEncoder()
const dc = new TextDecoder()

async function importKey(
  keyHex : string
) : Promise<CryptoKey> {
  /** Derive a shared key-pair and import as a
   *  CryptoKey object (for Webcrypto library).
   */
  const buffer  = Buffer.from(keyHex)
  const secret  = await sha256(buffer)
  const options : KeyAlgorithm = { name: 'AES-CBC' }
  const usage : KeyUsage[] = ['encrypt', 'decrypt']
  return crypto.subtle.importKey('raw', secret, options, true, usage)
}

export async function encrypt(
  message : string,
  keyHex  : string
) : Promise<string> {
  /** Encrypt a message using a CryptoKey object.
   * */
  const keyFile = await importKey(keyHex)
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const cipherBytes = await crypto.subtle
    .encrypt({ name: 'AES-CBC', iv }, keyFile, ec.encode(message))
    .then((bytes) : Uint8Array => new Uint8Array(bytes))
  // Return a concatenated and base64 encoded array.
  return Buffer.from(new Uint8Array([...iv, ...cipherBytes])).toString('base64')
}

export async function decrypt(
  encoded : string, 
  keyHex  : string
) : Promise<string> {
  /** Decrypt an encrypted message using a CryptoKey object.
   * */
  const keyFile = await importKey(keyHex)
  const bytes = Buffer.from(encoded, 'base64')
  const plainText = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: bytes.slice(0, 16) },
    keyFile,
    bytes.slice(16)
  )
  return dc.decode(plainText)
}
