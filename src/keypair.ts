import { Buff, Bytes }    from '@cmdcode/buff-utils'
import { Field, Point }   from './ecc.js'
import { getXOnlyPub }    from './utils.js'
import { sign, verify }   from './secp.js'

import {
  signer_defaults,
  SignerConfig,
  SignerOptions
} from './config/signer.js'

export class SecretKey extends Uint8Array {
  static random (config ?: SignerConfig) : SecretKey {
    // Return a random secret key.
    return new SecretKey(Buff.random(32), config)
  }

  readonly opt  : SignerOptions

  constructor (
    secret  : Bytes,
    config ?: SignerConfig
  ) {
    super(new Field(secret))
    this.opt = signer_defaults(config)
  }

  get buff () : Buff {
    return new Buff(this)
  }

  get raw () : Uint8Array {
    return this.buff.raw
  }

  get hex () : string {
    return this.buff.hex
  }

  get field () : Field {
    return (this.opt.xonly)
      ? new Field(this).negated
      : new Field(this)
  }

  get point () : Point {
    return this.field.point
  }

  get pub () : PublicKey {
    return new PublicKey(this.point.raw, this.opt)
  }

  get hasEvenY () : boolean {
    return this.point.hasEvenY
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  get xonly () : SecretKey {
    return new SecretKey(this.field.negated, this.opt)
  }

  add (bytes : Bytes) : SecretKey {
    return new SecretKey(this.field.add(bytes), this.opt)
  }

  sub (bytes : Bytes) : SecretKey {
    return new SecretKey(this.field.sub(bytes), this.opt)
  }

  mul (bytes : Bytes) : SecretKey {
    return new SecretKey(this.field.mul(bytes), this.opt)
  }

  div (bytes : Bytes) : SecretKey {
    return new SecretKey(this.field.div(bytes), this.opt)
  }

  pow (bytes : Bytes) : SecretKey {
    return new SecretKey(this.field.pow(bytes), this.opt)
  }

  negate () : SecretKey {
    return new SecretKey(this.field.negate(), this.opt)
  }

  sign (
    message : Bytes,
    config  : SignerConfig = this.opt
  ) : Buff {
    return sign(this.raw, message, config)
  }

  verify (
    signature : Bytes,
    message   : Bytes,
    config    : SignerConfig = this.opt
  ) : boolean {
    return verify(signature, message, this.pub.raw, config)
  }

  toWIF (prefix = 0x80) : string {
    return Buff.join([ prefix, this, 0x01 ]).b58chk
  }
}

export class PublicKey extends Uint8Array {
  static from_secret (
    bytes   : Bytes,
    config ?: SignerConfig
  ) : PublicKey {
    // Return a public key from a secret key.
    return new SecretKey(bytes, config).pub
  }

  static xonly = getXOnlyPub

  readonly opt : SignerOptions

  constructor (
    pubkey  : Bytes,
    config ?: SignerConfig
  ) {
    // Initialize our key config.
    const opt = signer_defaults(config)

    // handle x-only key policy.
    if (opt.xonly) {
      super(PublicKey.xonly(pubkey))
    } else {
      super(Buff.bytes(pubkey))
    }
    // Save key configuration.
    this.opt = opt
  }

  get buff () : Buff {
    return (this.opt.xonly)
      ? this.x
      : new Buff(this)
  }

  get raw () : Uint8Array {
    return this.buff.raw
  }

  get hex () : string {
    return this.buff.hex
  }

  get point () : Point {
    return new Point(this)
  }

  get x () : Buff {
    return this.point.x
  }

  get y () : Buff {
    return this.point.y
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  add (key : Bytes | PublicKey) : PublicKey {
    const point = (key instanceof PublicKey)
      ? this.point.add(key.point)
      : this.point.add(key)
    return new PublicKey(point.raw, this.opt)
  }

  sub (key : Bytes | PublicKey) : PublicKey {
    const point = (key instanceof PublicKey)
      ? this.point.sub(key.point)
      : this.point.sub(key)
    return new PublicKey(point.raw, this.opt)
  }

  mul (key : Bytes | PublicKey) : PublicKey {
    const point = (key instanceof PublicKey)
      ? this.point.mul(key.point)
      : this.point.mul(key)
    return new PublicKey(point.raw, this.opt)
  }

  negate () : PublicKey {
    return new PublicKey(this.point.negate().raw, this.opt)
  }

  verify (
    signature : Bytes,
    message   : Bytes,
    config    : SignerConfig = this.opt
  ) : boolean {
    return verify(signature, message, this, config)
  }
}

export const KeyPair = SecretKey
