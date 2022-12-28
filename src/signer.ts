import * as Noble  from '@noble/secp256k1'
import { KeyPair } from './ecc.js'
import { Buff, Bytes, Data } from '@cmdcode/buff-utils'

export type SignatureTypes = 'ecdsa' | 'schnorr'

export class Signer extends KeyPair {

  public readonly type : string

  static from(
    bytes : Bytes,
    type? : SignatureTypes
  ) : Signer {
    return new Signer(Buff.normalizeBytes(bytes), type)
  }

  static generate() : Signer {
    return new Signer(Buff.random(32))
  }

  constructor(
    secret : Uint8Array,
    type?  : SignatureTypes
  ) {
    super(secret)
    this.type = type ?? 'schnorr'
  }

  async sign(message : Data) : Promise<Uint8Array> {
    const msg = Buff.normalizeData(message)
    return (this.type === 'schnorr')
      ? Noble.schnorr.sign(msg, this.privateKey)
      : Noble.sign(msg, this.privateKey)
  }

  async verify(
    message   : Data,
    signature : Bytes
  ) : Promise<boolean> {
    const msg = Buff.normalizeData(message)
    const sig = Buff.normalizeBytes(signature)
    return (this.type === 'schnorr')
      ? Noble.schnorr.verify(sig, msg, this.xOnlyPub)
      : Noble.verify(sig, msg, this.publicKey)
  }

  static async verify(
    message   : Data,
    pubKey    : Bytes,
    signature : Bytes,
    type?     : SignatureTypes
  ) : Promise<boolean> {
    type = (type !== undefined) ? type : 'schnorr'
    const msg = Buff.normalizeData(message)
    const pub = Buff.normalizeBytes(pubKey)
    const sig = Buff.normalizeBytes(signature)
    return (type === 'schnorr')
      ? Noble.schnorr.verify(sig, msg, getXOnlyPub(pub))
      : Noble.verify(sig, msg, pub)
  }
}

function getXOnlyPub(key : Uint8Array) : Uint8Array {
  return (key.length === 33) ? key.slice(1) : key
}
