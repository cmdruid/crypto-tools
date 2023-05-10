import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'
import { Buff, Bytes } from '@cmdcode/buff-utils'
import { getXOnlyPub } from './utils.js'

export type SignatureType = 'ecdsa' | 'schnorr' | 'taproot'

export function sign (
  secret  : Bytes,
  message : Bytes,
  type    : SignatureType = 'schnorr'
) : Uint8Array {
  const msg = Buff.bytes(message).raw
  const key = Buff.bytes(secret).raw
  switch (type) {
    case 'ecdsa':
      return secp.sign(msg, key).toDERRawBytes()
    case 'schnorr':
      return schnorr.sign(msg, key)
    case 'taproot':
      return schnorr.sign(msg, key)
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}

export function verify (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  type      : SignatureType = 'schnorr'
) : boolean {
  const sig = Buff.bytes(signature).raw
  const msg = Buff.bytes(message).raw
  const pub = Buff.bytes(pubkey).raw
  switch (type) {
    case 'ecdsa':
      return secp.verify(sig, msg, pub)
    case 'schnorr':
      return schnorr.verify(sig, msg, getXOnlyPub(pub))
    case 'taproot':
      return schnorr.verify(sig, msg, getXOnlyPub(pub))
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}
