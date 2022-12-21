import * as Noble from '@noble/secp256k1'
import { Buff, Type } from '@cmdcode/buff-utils'
import { KeyPair }  from './ecc.js'

export type SignatureTypes = 'ecdsa' | 'schnorr'

export default class Signer extends KeyPair {

  public readonly type : string

  static from(
    bytes : Type.Bytes,
    type? : SignatureTypes
  ) : Signer {
    return new Signer(Buff.normalizeBytes(bytes), type)
  }

  constructor(
    secret : Uint8Array,
    type?  : SignatureTypes
  ) {
    super(secret)
    this.type = type ?? 'schnorr'
  }

  async sign(message : Type.Data) : Promise<Uint8Array> {
    const msg = Buff.normalizeData(message)
    return (this.type === 'schnorr')
      ? Noble.schnorr.sign(msg, this.privateKey)
      : Noble.sign(msg, this.privateKey)
  }

  async verify(
    message   : Type.Data,
    signature : Type.Bytes
  ) : Promise<boolean> {
    const msg = Buff.normalizeData(message)
    const sig = Buff.normalizeBytes(signature)
    return (this.type === 'schnorr')
      ? Noble.schnorr.verify(sig, msg, this.xOnlyPub)
      : Noble.verify(sig, msg, this.publicKey)
  }

  static async verify(
    message   : Type.Data,
    pubKey    : Type.Bytes,
    signature : Type.Bytes,
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
