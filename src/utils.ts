import { Buff, Bytes } from '@cmdcode/buff-utils'
import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'

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

export function getPublicKey (seckey : Bytes, xonly = false) : Buff {
  const bytes  = Buff.bytes(seckey)
  const pubkey = (xonly)
    ? schnorr.getPublicKey(bytes)
    : secp.getPublicKey(bytes)
  return Buff.raw(pubkey)
}
