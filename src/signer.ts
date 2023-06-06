import { secp256k1 as secp } from '@noble/curves/secp256k1'
import { Buff, Bytes }       from '@cmdcode/buff-utils'
import * as schnorr          from './schnorr.js'
import { Field, Point }      from './ecc.js'
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

export function verifyAll (
  signatures : SignaturePair[],
  message    : Bytes
) : boolean {
  // Make sure all data is converted to bytes.
  const pubs : string[] = [],
        nons : string[] = [],
        sigs : string[] = []

  for (const [ pub, sig ] of signatures) {
    pubs.push(Buff.bytes(pub).hex)
    nons.push(Buff.bytes(sig).slice(0, 32).hex)
    sigs.push(Buff.bytes(sig).slice(33).hex)
  }

  const pub0 = pubs.sort().shift(),
        non0 = nons.sort().shift(),
        sig0 = sigs.sort().shift()

  const agg_pub = pubs.reduce(pointReducer, pub0)
  const agg_non = nons.reduce(pointReducer, non0)
  const agg_sig = sigs.reduce(fieldReducer, sig0)

  if (agg_pub === undefined || agg_non === undefined || agg_sig === undefined) {
    throw new Error('Arguments contain undefined!')
  }

  console.log('agg_pub:', agg_pub)
  console.log('agg_non:', agg_non)
  console.log('agg_sig:', agg_sig)

  return schnorr.verify(agg_non + agg_sig, agg_pub, Buff.bytes(message))

  function fieldReducer (prev ?: string, curr ?: string) : string {
    if (prev === undefined || curr === undefined) {
      throw new Error('Pubkey is undefined!')
    }
    return new Field(prev).add(curr).hex
  }

  function pointReducer (prev ?: string, curr ?: string) : string {
    if (prev === undefined || curr === undefined) {
      throw new Error('Pubkey is undefined!')
    }
    return new Point(prev).add(new Point(curr)).x.hex
  }
}
