import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { modN }         from './math.js'

export function random (size ?: number) : Buff {
  return Buff.random(size)
}

export function mod_bytes (bytes : Bytes) : Buff {
  const b = Buff.bytes(bytes).big
  return Buff.big(modN(b), 32)
}

export function is_even_pub (pubkey : Bytes) : boolean {
  const pub = Buff.bytes(pubkey)
  switch (true) {
    case (pub.length === 32):
      return true
    case (pub.length === 33 && pub[0] === 0x02):
      return true
    case (pub.length === 33 && pub[0] === 0x03):
      return false
    default:
      throw new TypeError(`Invalid public key: ${pub.hex}`)
  }
}

export function xonly_pub (pubkey : Bytes) : Buff {
  const key = Buff.bytes(pubkey)
  switch (key.length) {
    case 32:
      return key
    case 33:
      return key.slice(1, 33)
    default:
      throw new Error(`Invalid key length: ${key.length}`)
  }
}
