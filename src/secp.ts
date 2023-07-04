import { secp256k1 as secp } from '@noble/curves/secp256k1'
import { Buff, Bytes }       from '@cmdcode/buff-utils'
import * as schnorr          from './schnorr.js'

import {
  signer_defaults,
  SignerConfig
} from './config/signer.js'

export type SignaturePair = [
  pubkey    : Bytes,
  signature : Bytes
]

export function sign (
  secret   : Bytes,
  message  : Bytes,
  config  ?: SignerConfig
) : Buff {
  const { type } = signer_defaults(config)
  const msg = Buff.bytes(message).raw
  const key = Buff.bytes(secret).raw
  switch (type) {
    case 'ecdsa':
      return Buff.raw(secp.sign(msg, key).toDERRawBytes())
    case 'schnorr':
      return schnorr.sign(key, msg, config)
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}

export function verify (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  config   ?: SignerConfig
) : boolean {
  const opt = signer_defaults(config)
  const sig = Buff.bytes(signature).raw
  const msg = Buff.bytes(message).raw
  const pub = Buff.bytes(pubkey).raw

  switch (opt.type) {
    case 'ecdsa':
      return secp.verify(sig, msg, pub)
    case 'schnorr':
      return schnorr.verify(sig, msg, pub, opt)
    default:
      throw new Error('Unknown signature type:' + String(opt.type))
  }
}
