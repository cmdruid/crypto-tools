import { Buff, Bytes } from '@cmdcode/buff-utils'
import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'
import { Field, Point } from './ecc.js'
import { hmac } from './hash.js'

export function assert (
  error  : string,
  throws : boolean
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

export function getXOnlyPub (bytes : Bytes) : Buff {
  const b = Buff.bytes(bytes)
  if (b.length === 33) {
    return b.slice(1, 33)
  }
  if (b.length === 32) {
    return b
  }
  throw new Error('Invalid key length: ' + String(b.length))
}

export function getPublicKey (
  seckey : Bytes,
  xonly = false
) : Buff {
  const bytes  = Buff.bytes(seckey)
  const pubkey = (xonly)
    ? schnorr.getPublicKey(bytes)
    : secp.getPublicKey(bytes)
  return Buff.raw(pubkey)
}

export function getSharedKey (
  seckey : Bytes,
  pubkey : Bytes,
  xonly  = false
) : Buff {
  const P = new Point(pubkey)
  const s = P.mul(seckey)
  return (xonly) ? s.x : s.buff
}

export function getSecretKey (
  secret : Bytes,
  xonly  : boolean = false
) : Buff {
  let sk = new Field(secret)
  if (xonly && sk.point.hasOddY) {
    sk = sk.negate()
  }
  return sk.buff
}

export function checkSize (input : Bytes, size : number) : void {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    throw new Error(`Invalid input size: ${bytes.hex} !== ${size}`)
  }
}

export function tagHash (
  tag  : string,
  data : Bytes[]
) : Buff {
  const hash = Buff.str(tag).digest
  return Buff.join([ hash, hash, ...data ]).digest
}

export function getSharedCode (
  sec_key : string,  // Disposable secret key.
  pub_key : string,  // Cold storage public key.
  path    : string,  // Configurable HD path.
  key     = '/'      // Key prefix (for versioning).
) : Buff {
  /**
   * We can recover this code from our cold storage key,
   * by knowing the pubkey of the signer (via another medium),
   * the protocol version, and the HD path used.
   */
  // Tag prefix should be used for versioning.
  const hash = tagHash(key, [ path ])
  // Derive a linked key (from the cold storage key).
  const link = getSharedKey(sec_key, pub_key)
  // Use the linked key to produce a 512-bit HMAC code.
  return hmac(link, hash, '512').slice(0, 32)
}
