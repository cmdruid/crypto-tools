import { webcrypto as crypto } from 'crypto'

export function getRandBytes(size : number = 32) : Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size))
}
