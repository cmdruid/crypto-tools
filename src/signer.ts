import * as Noble      from '@cmdcode/secp256k1'
import { Buff, Bytes } from '@cmdcode/buff-utils'

export type SignatureTypes = 'ecdsa' | 'schnorr'

export async function sign (
  message : Bytes,
  secret  : Bytes,
  type    : SignatureTypes = 'schnorr'
) : Promise<Uint8Array> {
  const msg = Buff.normalize(message)
  const key = Buff.normalize(secret)
  return (type === 'schnorr')
    ? Noble.schnorr.sign(msg, key)
    : Noble.sign(msg, key)
}

export async function verify (
  message   : Bytes,
  pubKey    : Bytes,
  signature : Bytes,
  type      : SignatureTypes = 'schnorr'
) : Promise<boolean> {
  const msg = Buff.normalize(message)
  const pub = Buff.normalize(pubKey)
  const sig = Buff.normalize(signature)
  return (type === 'schnorr')
    ? Noble.schnorr.verify(sig, msg, getXOnlyPub(pub))
    : Noble.verify(sig, msg, pub)
}

function getXOnlyPub (key : Uint8Array) : Uint8Array {
  return (key.length > 32) ? key.slice(1) : key
}
