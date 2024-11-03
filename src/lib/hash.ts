import { pbkdf2 }            from '@noble/hashes/pbkdf2'
import { sha256 as s256 }    from '@noble/hashes/sha256'
import { sha512 as s512 }    from '@noble/hashes/sha512'
import { ripemd160 as r160 } from '@noble/hashes/ripemd160'
import { hmac as HMAC }      from '@noble/hashes/hmac'
import { Buff, Bytes }       from '@cmdcode/buff'

export function sha256 (...data : Bytes[]) : Buff {
  const b = Buff.join(data)
  return Buff.raw(s256(b))
}

export function sha512 (...data : Bytes[]) : Buff {
  const b = Buff.join(data)
  return Buff.raw(s512(b))
}

export function ripe160 (...data : Bytes[]) : Buff {
  const b = Buff.join(data)
  return Buff.raw(r160(b))
}

export function hash256 (...data : Bytes[]) : Buff {
  const b = Buff.join(data)
  return Buff.raw(s256(s256(b)))
}

export function hash160 (...data : Bytes[]) : Buff {
  const b = Buff.join(data)
  return Buff.raw(r160(s256(b)))
}

export function hmac256 (
  key     : Bytes,
  ...data : Bytes[]
) : Buff {
  const k = Buff.bytes(key)
  const b = Buff.join(data)
  return Buff.raw(HMAC(s256, k, b))
}

export function hmac512 (
  key     : Bytes,
  ...data : Bytes[]
) : Buff {
  const k = Buff.bytes(key)
  const b = Buff.join(data)
  return Buff.raw(HMAC(s512, k, b))
}

export function taghash (tag : string) : Buff {
  const hash = Buff.str(tag).digest
  return Buff.join([ hash, hash ])
}

export function hash340 (
  tag : string,
  ...data : Bytes[]
) : Buff {
  const hash = taghash(tag)
  return Buff.join([ hash, ...data ]).digest
}

export function pkdf256 (
  secret : Bytes,
  salt   : Bytes,
  count  = 2048
) {
  const sec = Buff.bytes(secret)
  const slt = Buff.bytes(salt)
  const key = pbkdf2(s256, sec, slt, { c: count, dkLen : 32 })
  return Buff.raw(key)
}

export function pkdf512 (
  secret : Bytes,
  salt   : Bytes,
  count  = 2048
) {
  const sec = Buff.bytes(secret)
  const slt = Buff.bytes(salt)
  const key = pbkdf2(s512, sec, slt, { c: count, dkLen : 64 })
  return Buff.raw(key)
}
