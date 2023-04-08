import * as Noble      from '@cmdcode/secp256k1'
import { Buff, Bytes } from '@cmdcode/buff-utils'
import { KeyUtil } from './utils.js'

export type SignatureTypes = 'ecdsa' | 'schnorr'

export async function sign (
  secret  : Bytes,
  message : Bytes,
  type    : SignatureTypes = 'schnorr'
) : Promise<Uint8Array> {
  const msg = Buff.bytes(message).raw
  const key = Buff.bytes(secret).raw
  switch (type) {
    case 'ecdsa':
      return Noble.sign(msg, key)
    case 'schnorr':
      return Noble.schnorr.sign(msg, key)
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}

export async function verify (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  type      : SignatureTypes = 'schnorr'
) : Promise<boolean> {
  const sig = Buff.bytes(signature).raw
  const msg = Buff.bytes(message).raw
  const pub = Buff.bytes(pubkey).raw
  switch (type) {
    case 'ecdsa':
      return Noble.verify(sig, msg, pub)
    case 'schnorr':
      return Noble.schnorr.verify(sig, msg, KeyUtil.xOnlyPub(pub))
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}
