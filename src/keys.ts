import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { random }       from './utils.js'

import {
  hashtag,
  hmac512
} from './hash.js'

export function genSecretKey () : Buff {
  return getSecretKey(random(32))
}

export function getSecretKey (secret : Bytes) : Buff {
  return Field.mod(secret).buff
}

export function getPublicKey (
  seckey : Bytes,
  xonly  = false
) : Buff {
  const p = Field.mod(seckey).point
  return (xonly) ? p.x : p.buff
}

export function getKeyPair (
  secret : Bytes,
  xonly ?: boolean
) : [ Buff, Buff ] {
  const sec = getSecretKey(secret)
  const pub = getPublicKey(sec, xonly)
  return [ sec, pub ]
}

export function genKeyPair (
  xonly ?: boolean
) : [ Buff, Buff ] {
  const sec = genSecretKey()
  return getKeyPair(sec, xonly)
}

export function getSharedKey (
  seckey : Bytes,
  pubkey : Bytes
) : Buff {
  const P  = Point.from_x(pubkey)
  const sp = Field.mod(seckey)
  const sh = P.mul(sp)
  return sh.buff
}

export function getSharedCode (
  self_sec : Bytes,
  peer_pub : Bytes,
  tag   = 'ecdh/code'
) : Buff {
  const hash = hashtag(tag)
  const sec  = getSecretKey(self_sec)
  const pub  = getPublicKey(sec)
  const peer = Buff.bytes(peer_pub)
  // Derive a linked key (from the cold storage key).
  const link = getSharedKey(sec, peer)
  // Sort the keys lexographically.
  const keys = [ pub.hex, peer.hex ]
  keys.sort()
  // Use the linked key to produce a 512-bit HMAC code.
  return hmac512(link, Buff.join([ hash, ...keys ]))
}
