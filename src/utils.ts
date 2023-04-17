import { Buff, Bytes } from '@cmdcode/buff-utils'

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
