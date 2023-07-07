import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { hmac512 }      from './hash.js'
import { modN }         from './math.js'

export function fail (
  error  : string,
  throws = false
) : boolean {
  if (throws) {
    throw new Error(error)
  } else {
    return false
  }
}

export function random (size ?: number) : Buff {
  return Buff.random(size)
}

export function hashtag (tag : string) : Buff {
  const hash = Buff.str(tag).digest
  return Buff.join([ hash, hash ])
}

export function digest (
  tag  : string,
  data : Bytes[] = []
) : Buff {
  const hash = hashtag(tag)
  return Buff.join([ hash, ...data ]).digest
}

export function genSecretKey (size = 32) : Buff {
  return getSecretKey(random(size))
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

export function mod_bytes (bytes : Bytes) : Buff {
  const b = Buff.bytes(bytes).big
  return Buff.big(modN(b), 32)
}
