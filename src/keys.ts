import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { random }       from './utils.js'
import { ExtendedKey }  from './types.js'

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

export function gen_seckey (
  even_y ?: boolean
) : Buff {
  return get_seckey(random(32), even_y)
}

export function get_seckey (
  secret : Bytes,
  even_y = false
) : Buff {
  const sec = Field.mod(secret)
  return (even_y) ? sec.negated.buff : sec.buff
}

export function get_pubkey (
  seckey : Bytes,
  x_only = false
) : Buff {
  const p = Field.mod(seckey).point
  return (x_only) ? p.x : p.buff
}

export function tweak_seckey (
  seckey : Bytes,
  tweaks : Bytes[] = [],
  even_y = false
) : Buff {
  let sec = Field.mod(seckey)
  for (const twk of tweaks) {
    sec = sec.add(twk)
    if (even_y) sec = sec.negated
  }
  return sec.buff
}

export function tweak_pubkey (
  pubkey : Bytes,
  tweaks : Bytes[] = [],
  x_only = false
) : Buff {
  let pub = Point.from_x(pubkey, x_only)
  for (const twk of tweaks) {
    pub = pub.add(twk)
    if (x_only) pub = pub.negated
  }
  return (x_only) ? pub.x : pub.buff
}

export function get_keypair (
  secret  : Bytes,
  x_only ?: boolean,
  even_y ?: boolean
) : [ Buff, Buff ] {
  const sec = get_seckey(secret, even_y)
  const pub = get_pubkey(sec, x_only)
  return [ sec, pub ]
}

export function gen_keypair (
  x_only ?: boolean,
  even_y ?: boolean
) : [ Buff, Buff ] {
  const sec = random(32)
  return get_keypair(sec, x_only, even_y)
}

export function normalize_32 (pubkey : Bytes) : Buff {
  const key = Buff.bytes(pubkey)
  if (key.length === 32) return key
  if (key.length === 33) return key.slice(1, 33)
  throw new TypeError(`Invalid key length: ${key.length}`)
}

export function normalize_33 (
  pubkey : Bytes,
  even_y = false
) : Buff {
  const key = Buff.bytes(pubkey)
  if (key.length === 32) {
    return key.prepend(0x02)
  } else if (key.length === 33) {
    if (even_y) key[0] = 0x02
    return key
  }
  throw new TypeError(`Invalid key size: ${key.length}`)
}

export function parse_ext_key (
  keydata : string
) : ExtendedKey {
  /* Import a Base58 formatted string as a
    * BIP32 (extended) KeyLink object.
    */
  const buffer = Buff.b58chk(keydata).stream

  const data = {
    prefix : buffer.read(4).num,  // Version prefix.
    depth  : buffer.read(1).num,  // Parse depth ([0x00] for master).
    fprint : buffer.read(4).num,  // Parent key reference (0x00000000 for master).
    index  : buffer.read(4).num,  // Key index.
    code   : buffer.read(32).hex, // Chaincode.
    type   : buffer.read(1).num,  // Key type (or parity).
    key    : buffer.read(32).hex  // 32-byte key.
  }

  if (buffer.size > 0) {
    throw new TypeError('Unparsed data remaining in buffer!')
  }

  return data
}
