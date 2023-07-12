import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { random }       from './utils.js'

import {
  taghash,
  hmac512
} from './hash.js'

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

export function parse_x (pubkey : Bytes) : Buff {
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

export function gen_secret_key () : Buff {
  return get_secret_key(random(32))
}

export function get_secret_key (secret : Bytes) : Buff {
  return Field.mod(secret).buff
}

export function get_public_key (
  seckey : Bytes,
  xonly  = false
) : Buff {
  const p = Field.mod(seckey).point
  return (xonly) ? p.x : p.buff
}

export function get_pair_keys (
  secret : Bytes,
  xonly ?: boolean
) : [ Buff, Buff ] {
  const sec = get_secret_key(secret)
  const pub = get_public_key(sec, xonly)
  return [ sec, pub ]
}

export function gen_pair_keys (
  xonly ?: boolean
) : [ Buff, Buff ] {
  const sec = gen_secret_key()
  return get_pair_keys(sec, xonly)
}

export function get_shared_key (
  seckey : Bytes,
  pubkey : Bytes
) : Buff {
  const P  = Point.from_x(pubkey)
  const sp = Field.mod(seckey)
  const sh = P.mul(sp)
  return sh.buff
}

export function get_shared_code (
  self_sec : Bytes,
  peer_pub : Bytes,
  tag   = 'ecdh/code'
) : Buff {
  const hash = taghash(tag)
  const sec  = get_secret_key(self_sec)
  const pub  = get_public_key(sec)
  const peer = Buff.bytes(peer_pub)
  // Derive a linked key (from the cold storage key).
  const link = get_shared_key(sec, peer)
  // Sort the keys lexographically.
  const keys = [ pub.hex, peer.hex ]
  keys.sort()
  // Use the linked key to produce a 512-bit HMAC code.
  return hmac512(link, Buff.join([ hash, ...keys ]))
}
