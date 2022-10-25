import { webcrypto as crypto } from 'crypto'
import { ripemd160 } from './ripemd160.js'

async function digest(
  bytes  : Uint8Array, 
  rounds : number = 1, 
  format : string = 'SHA-256'
) : Promise<Uint8Array> {
  let buff = new ArrayBuffer(0)
  for (let i = 0; i < rounds; i++) {
    buff = await crypto.subtle.digest(format, bytes)
  }
  return new Uint8Array(buff)
}

export async function sha256(
  bytes : Uint8Array
) : Promise<Uint8Array> {
  return await digest(bytes, 1, 'SHA-256')
}

export async function sha512(
  bytes : Uint8Array
) : Promise<Uint8Array> {
  return await digest(bytes, 1, 'SHA-512')
}

export function ripe160(
  bytes : Uint8Array
): Uint8Array {
  return ripemd160(bytes)
}

export async function hash256(
  bytes : Uint8Array
) : Promise<Uint8Array> {
  return await digest(bytes, 2, 'SHA-256')
}

export async function hash160(
  bytes : Uint8Array
) : Promise<Uint8Array> {
  return ripe160(await sha256(bytes))
}