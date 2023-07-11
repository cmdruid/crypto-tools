import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { modN }         from './math.js'
import { ExtendedKey }  from './types.js'

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

export function increment_buffer (buffer : Uint8Array) : Uint8Array {
  /* Find the least significant integer value in the
   * data buffer (using LE), then increment it by one.
   */
  let i = buffer.length - 1
  for (i; i >= 0; i--) {
    if (buffer[i] < 255) {
      buffer.set([ buffer[i] + 1 ], i)
      return buffer
    }
  }
  throw TypeError('Unable to increment buffer: ' + buffer.toString())
}

export function parse_extended_key (
  keydata : string
) : ExtendedKey {
  /* Import a Base58 formatted string as a
    * BIP32 (extended) KeyLink object.
    */
  const buffer = Buff.b58chk(keydata).stream

  const data = {
    prefix : buffer.read(4).num,
    depth  : buffer.read(1).num,  // Parse depth ([0x00] for master).
    fprint : buffer.read(4).num,  // Parent key reference (0x00000000 for master).
    index  : buffer.read(4).num,  // Key index.
    code   : buffer.read(32).hex, // Chaincode.
    type   : buffer.read(1).num,  // Key type
    key    : buffer.read(32).hex
  }

  if (buffer.size > 0) {
    throw new TypeError('Unparsed data remaining in buffer!')
  }

  return data
}
