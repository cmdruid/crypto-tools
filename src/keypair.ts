import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { sign, SignatureTypes, verify } from './signer.js'

export class SecretKey extends Field {
  static random () : SecretKey {
    // Return a random secret key.
    return new SecretKey(Buff.random(32))
  }

  static negated (secret : Bytes) : SecretKey {
    // Enforce even-only keys.
    const f = new Field(secret)
    return (f.hasOddY)
      ? new SecretKey(f.negated)
      : new SecretKey(f)
  }

  constructor (
    secret : Bytes,
    evenOnly = false
  ) {
    if (evenOnly) {
      // Enforce even-only keys.
      secret = SecretKey.negated(secret)
    }
    super(secret)
  }

  get pub () : PublicKey {
    return new PublicKey(this.point.raw)
  }

  async sign (
    message : Bytes,
    type   ?: SignatureTypes
  ) : Promise<Uint8Array> {
    const msg = Buff.normalize(message)
    return sign(msg, this.raw, type)
  }

  async verify (
    message   : Bytes,
    signature : Bytes,
    type     ?: SignatureTypes
  ) : Promise<boolean> {
    return verify(message, this.pub.raw, signature, type)
  }
}

export class PublicKey extends Point {
  static random () : PublicKey {
    // Return a random public key.
    return SecretKey.random().pub
  }

  constructor (bytes : Bytes) {
    super(Buff.normalize(bytes))
  }

  async verify (
    message   : Bytes,
    signature : Bytes,
    type     ?: SignatureTypes
  ) : Promise<boolean> {
    return verify(message, this.raw, signature, type)
  }
}

export const KeyPair = SecretKey
