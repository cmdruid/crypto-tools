import * as Noble      from '@noble/secp256k1'
import { Buff, Bytes } from '@cmdcode/buff-utils'
import { KeyPair }     from './ecc.js'

export type SignatureTypes = 'ecdsa' | 'schnorr'

export class Signer extends KeyPair {
  public readonly type : SignatureTypes

  static generate () : Signer {
    return new Signer(Buff.random(32))
  }

  constructor (
    secret : Bytes,
    type   : SignatureTypes = 'schnorr'
  ) {
    super(secret)
    this.type = type
  }

  async sign (message : Bytes) : Promise<Uint8Array> {
    const msg = Buff.normalize(message)
    return Signer.sign(msg, this.privateKey, this.type)
  }

  async verify (
    message   : Bytes,
    signature : Bytes
  ) : Promise<boolean> {
    return Signer.verify(message, this.publicKey, signature, this.type)
  }

  static async sign (
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

  static async verify (
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
}

function getXOnlyPub (key : Uint8Array) : Uint8Array {
  return (key.length === 33) ? key.slice(1) : key
}
