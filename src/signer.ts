import * as Noble from '@noble/secp256k1'
import { Buff }   from '@cmdcode/buff-utils'
import { Field }  from './ecc.js'
import { Bytes, normalize } from './util.js'

const ec = new TextEncoder()

export type SignatureTypes = 'ecdsa' | 'schnorr'

export default class Signer {

  private readonly secret : Uint8Array

  static from(bytes : Bytes) : Signer {
    return new Signer(normalize(bytes))
  }

  constructor(
    privKey : Uint8Array,
  ) {
    this.secret = privKey
  }

  get pubKey() : Uint8Array {
    return new Field(this.secret).point.rawX
  }

  get pubHex() : string {
    return new Buff(this.pubKey).toHex()
  }

  async sign(
    msg  : string | Uint8Array,
    type : SignatureTypes = 'schnorr'
  ) : Promise<Uint8Array> {
    msg = (typeof msg === 'string') ? ec.encode(msg) : msg
    return (type === 'schnorr')
      ? Noble.schnorr.sign(msg, this.secret)
      : Noble.sign(msg, this.secret)
  }

  static async verify(
    msg       : string | Uint8Array,
    pubKey    : Bytes,
    signature : Bytes,
    type : SignatureTypes = 'schnorr'
  ) : Promise<boolean> {
    msg = (typeof msg === 'string') ? ec.encode(msg) : msg
    const pub = normalize(pubKey)
    const sig = normalize(signature)
    return (type === 'schnorr')
      ? Noble.schnorr.verify(sig, msg, pub)
      : Noble.verify(sig, msg, pub)
  }
}
