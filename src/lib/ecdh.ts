import { Buff, Bytes } from '@cmdcode/buff'
import { Point }       from './ecc.js'
import { hmac256 }     from './hash.js'

import {
  get_pubkey,
  get_seckey,
  parse_pubkey
}  from './keys.js'

export function ecdh (
  self_sec : Bytes,
  peer_pub : Bytes,
  xonly    = false
) : Buff {
  const P   = Point.from_x(peer_pub)
  const sec = get_seckey(self_sec)
  const shared = P.mul(sec)
  return (xonly) ? shared.x : shared.buff
}

export function ecdhash (
  self_sec : Bytes,
  peer_pub : Bytes,
  xonly    = false
) : Buff {
  const p1   = get_pubkey(self_sec, xonly)
  const p2   = parse_pubkey(peer_pub, xonly)
  const seed = ecdh(self_sec, peer_pub, xonly)
  const pubs = [ p1.hex, p2.hex ].sort()
  return hmac256(seed, ...pubs)
}
