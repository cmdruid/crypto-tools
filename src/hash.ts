import { sha256    as s256 } from '@noble/hashes/sha256'
import { sha512    as s512 } from '@noble/hashes/sha512'
import { ripemd160 as r160 } from '@noble/hashes/ripemd160'
import { hmac      as HMAC } from '@noble/hashes/hmac'
import { Buff, Bytes }       from '@cmdcode/buff-utils'

export function sha256 (msg : Bytes) : Buff {
  const m = Buff.bytes(msg)
  return Buff.raw(s256(m))
}

export function sha512 (msg : Bytes) : Buff {
  const m = Buff.bytes(msg)
  return Buff.raw(s512(m))
}

export function ripe160 (msg : Bytes) : Buff {
  const m = Buff.bytes(msg)
  return Buff.raw(r160(m))
}

export function hash256 (msg : Bytes) : Buff {
  const m = Buff.bytes(msg)
  return Buff.raw(s256(s256(m)))
}

export function hash160 (msg : Bytes) : Buff {
  const m = Buff.bytes(msg)
  return Buff.raw(r160(s256(m)))
}

export function hmac256 (
  key : Bytes,
  msg : Bytes
) : Buff {
  const k = Buff.bytes(key)
  const m = Buff.bytes(msg)
  return Buff.raw(HMAC(s256, k, m))
}

export function hmac512 (
  key : Bytes,
  msg : Bytes
) : Buff {
  const k = Buff.bytes(key)
  const m = Buff.bytes(msg)
  return Buff.raw(HMAC(s512, k, m))
}
