import { webcrypto as crypto } from 'crypto'
import ripemd160 from './ripemd.js'
import { importHmac } from './keys.js'

async function digest(
  bytes: Uint8Array,
  format: string = 'SHA-256',
  rounds: number = 1
): Promise<Uint8Array> {
  let i, buffer = bytes.buffer
  for (i = 0; i < rounds; i++) {
    buffer = await crypto.subtle.digest(format, buffer)
  }
  return new Uint8Array(buffer)
}

export async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return digest(bytes, 'SHA-256')
}

export async function sha512(bytes: Uint8Array): Promise<Uint8Array> {
  return digest(bytes, 'SHA-512')
}

export function ripe160(bytes: Uint8Array): Uint8Array {
  return ripemd160(bytes)
}

export async function hash256(bytes: Uint8Array): Promise<Uint8Array> {
  return digest(bytes, 'SHA-256', 2)
}

export async function hash160(bytes: Uint8Array): Promise<Uint8Array> {
  return ripe160(await sha256(bytes))
}

export async function hmac256(
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const keyfile = await importHmac(key, 'SHA-256')
  return crypto.subtle
    .sign('HMAC', keyfile, data)
    .then((buffer) => new Uint8Array(buffer))
}

export async function hmac512(
  key: Uint8Array,
  data: Uint8Array
): Promise<Uint8Array> {
  const keyfile = await importHmac(key, 'SHA-512')
  return crypto.subtle
    .sign('HMAC', keyfile, data)
    .then((buffer) => new Uint8Array(buffer))
}
