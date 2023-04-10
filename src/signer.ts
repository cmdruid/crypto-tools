import * as Noble      from '@cmdcode/secp256k1'
import { Buff, Bytes } from '@cmdcode/buff-utils'
import { getXOnlyPub } from './utils.js'

export type SignatureType = 'ecdsa' | 'taproot'

export async function sign (
  secret  : Bytes,
  message : Bytes,
  type    : SignatureType = 'taproot'
) : Promise<Uint8Array> {
  const msg = Buff.bytes(message).raw
  const key = Buff.bytes(secret).raw
  switch (type) {
    case 'ecdsa':
      return Noble.sign(msg, key)
    case 'taproot':
      return Noble.schnorr.sign(msg, key)
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}

export async function verify (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  type      : SignatureType = 'taproot'
) : Promise<boolean> {
  const sig = Buff.bytes(signature).raw
  const msg = Buff.bytes(message).raw
  const pub = Buff.bytes(pubkey).raw
  switch (type) {
    case 'ecdsa':
      return Noble.verify(sig, msg, pub)
    case 'taproot':
      return Noble.schnorr.verify(sig, msg, getXOnlyPub(pub))
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}
