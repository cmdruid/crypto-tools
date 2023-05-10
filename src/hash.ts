import { sha256 as s256 }    from '@noble/hashes/sha256'
import { sha512 as s512 }    from '@noble/hashes/sha512'
import { ripemd160 as r160 } from '@noble/hashes/ripemd160'
import { hmac }              from '@noble/hashes/hmac'
import { Buff, Bytes }       from '@cmdcode/buff-utils'

export function sha256 (msg : Bytes) : Uint8Array {
  return s256(Buff.bytes(msg))
}

export function sha512 (msg : Bytes) : Uint8Array {
  return s512(Buff.bytes(msg))
}

export function ripe160 (msg : Bytes) : Uint8Array {
  return s512(Buff.bytes(msg))
}

export function hash256 (msg : Bytes) : Uint8Array {
  return s256(s256(Buff.bytes(msg)))
}

export function hash160 (msg : Bytes) : Uint8Array {
  return r160(s256(Buff.bytes(msg)))
}

export function hmac256 (key : Bytes, msg : Bytes) : Uint8Array {
  return hmac(s256, Buff.bytes(key), Buff.bytes(msg))
}

export function hmac512 (key : Bytes, msg : Bytes) : Uint8Array {
  return hmac(s512, Buff.bytes(key), Buff.bytes(msg))
}
