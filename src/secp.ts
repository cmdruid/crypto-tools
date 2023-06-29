import { secp256k1 as secp } from '@noble/curves/secp256k1'
import { Buff, Bytes }       from '@cmdcode/buff-utils'
import * as schnorr          from './schnorr.js'
import { SIGNER_DEFAULT }    from './schema/defaults.js'
import { SignerConfig }      from './schema/types.js'

export type SignaturePair = [
  pubkey    : Bytes,
  signature : Bytes
]

export function sign (
  secret  : Bytes,
  message : Bytes,
  options : Partial<SignerConfig> = {}
) : Buff {
  const { type } = { ...SIGNER_DEFAULT, ...options }
  const msg = Buff.bytes(message).raw
  const key = Buff.bytes(secret).raw
  switch (type) {
    case 'ecdsa':
      return Buff.raw(secp.sign(msg, key).toDERRawBytes())
    case 'schnorr':
      return schnorr.sign(key, msg, options)
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}

export function verify (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  options   : Partial<SignerConfig> = {}
) : boolean {
  const { type } = { ...SIGNER_DEFAULT, ...options }
  const sig = Buff.bytes(signature).raw
  const msg = Buff.bytes(message).raw
  const pub = Buff.bytes(pubkey).raw
  switch (type) {
    case 'ecdsa':
      return secp.verify(sig, msg, pub)
    case 'schnorr':
      return schnorr.verify(sig, msg, pub, options)
    default:
      throw new Error('Unknown signature type:' + String(type))
  }
}
