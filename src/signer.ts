import * as Noble from '@noble/secp256k1'

import {
  Buff,
  Bytes,
  Data
} from '@cmdcode/buff-utils'

import { KeyPair } from './ecc.js'

export type SignatureTypes = 'ecdsa' | 'schnorr'

export class Signer extends KeyPair {
  public readonly type : string

  static generate () : Signer {
    return new Signer(Buff.random(32))
  }

  constructor (
    secret : Bytes,
    type ?: SignatureTypes
  ) {
    super(secret)
    this.type = type ?? 'schnorr'
  }

  async sign (message : Data) : Promise<Uint8Array> {
    const msg = Buff.serialize(message)
    return (this.type === 'schnorr')
      ? Noble.schnorr.sign(msg, this.privateKey)
      : Noble.sign(msg, this.privateKey)
  }

  async verify (
    message   : Data,
    signature : Bytes
  ) : Promise<boolean> {
    const msg = Buff.serialize(message)
    const sig = Buff.normalize(signature)
    return (this.type === 'schnorr')
      ? Noble.schnorr.verify(sig, msg, this.xOnlyPub)
      : Noble.verify(sig, msg, this.publicKey)
  }

  static async verify (
    message   : Data,
    pubKey    : Bytes,
    signature : Bytes,
    type ?: SignatureTypes
  ) : Promise<boolean> {
    type = (type !== undefined) ? type : 'schnorr'
    const msg = Buff.serialize(message)
    const pub = Buff.normalize(pubKey)
    const sig = Buff.normalize(signature)
    return (type === 'schnorr')
      ? Noble.schnorr.verify(sig, msg, getXOnlyPub(pub))
      : Noble.verify(sig, msg, pub)
  }
}

function getXOnlyPub (key : Uint8Array) : Uint8Array {
  return (key.length === 33) ? key.slice(1) : key
}
