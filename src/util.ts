import { webcrypto as crypto } from 'crypto'
import { Buff } from '@cmdcode/buff-utils'

export type Bytes = string | Uint8Array

export function getRandBytes(size: number = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size))
}

export function normalize(data : Bytes) : Uint8Array {
  return (typeof data === 'string')
    ? Buff.hex(data).toBytes()
    : data
}
