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
  xonly  = false
) : Buff {
  const p = Field.mod(seckey).point
  return (xonly) ? p.x : p.buff
}

export function get_keypair (
  secret  : Bytes,
  xonly  ?: boolean,
  even_y ?: boolean
) : [ Buff, Buff ] {
  const sec = get_seckey(secret, even_y)
  const pub = get_pubkey(sec, xonly)
  return [ sec, pub ]
}

export function gen_keypair (
  xonly  ?: boolean,
  even_y ?: boolean
) : [ Buff, Buff ] {
  const sec = random(32)
  return get_keypair(sec, xonly, even_y)
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
  const sec  = get_seckey(self_sec)
  const pub  = get_pubkey(sec)
  const peer = Buff.bytes(peer_pub)
  // Derive a linked key (from the cold storage key).
  const link = get_shared_key(sec, peer)
  // Sort the keys lexographically.
  const keys = [ pub.hex, peer.hex ]
  keys.sort()
  // Use the linked key to produce a 512-bit HMAC code.
  return hmac512(link, Buff.join([ hash, ...keys ]))
}
