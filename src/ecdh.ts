import { Buff, Bytes } from '@cmdcode/buff'
import { Point }       from './ecc.js'

import {
  get_pubkey,
  get_seckey,
  parse_pubkey
} from './keys.js'

import { taghash, hmac512 } from './hash.js'

export function get_shared_key (
  self_sec : Bytes,
  peer_pub : Bytes,
  xonly    = false
) : Buff {
  const P   = Point.from_x(peer_pub)
  const sec = get_seckey(self_sec)
  const shared = P.mul(sec)
  return (xonly) ? shared.x : shared.buff
}

export function get_shared_code (
  self_sec : Bytes,
  peer_pub : Bytes,
  message  : Bytes,
  prefix   = 'ecdh/hmac_512'
) : Buff {
  const pub  = get_pubkey(self_sec, true)
  const peer = parse_pubkey(peer_pub, true)
  const tag  = taghash(prefix)
  // Derive a shared key.
  const shared = get_shared_key(self_sec, peer_pub)
  // Sort the pub keys lexographically.
  const pubs = [ pub.hex, peer.hex ].sort()
  // Use the shared key to sign a SHA512 digest.
  return hmac512(shared, Buff.join([ ...tag, ...pubs, message ]))
}
