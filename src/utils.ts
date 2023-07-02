import { Buff, Bytes } from '@cmdcode/buff-utils'
import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'
import { Field, Point } from './ecc.js'

export function getRandom (size ?: number) : Buff {
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
  let   sk = Buff.bytes(secret).big % Field.N
  const pk = getPublicKey(Buff.big(sk, 32))
  if (xonly && pk[0] === 3) {
    sk = Field.N - sk
  }
  return Buff.big(sk, 32)
}

export function checkSize (input : Bytes, size : number) : void {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    throw new Error(`Invalid input size: ${bytes.hex} !== ${size}`)
  }
}

export function safeThrow (
  errorMsg    : string,
  shouldThrow : boolean
) : boolean {
  if (shouldThrow) {
    throw new Error(errorMsg)
  } else { return false }
}

export function hashTag (
  tag : string,
  ...data : Bytes[]
) : Buff {
  const htag = Buff.str(tag).digest.raw
  const buff = data.map(e => Buff.normalize(e))
  return Buff.join([ htag, htag, Buff.join(buff) ]).digest
}
