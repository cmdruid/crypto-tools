import { Buff, Bytes }    from '@cmdcode/buff-utils'
import { Field, Point }   from './ecc.js'
import { getXOnlyPub }    from './utils.js'
import { sign, verify }   from './signer.js'
import { SIGNER_DEFAULT } from './schema/defaults.js'
import { SignerConfig }   from './schema/types.js'

export class SecretKey extends Uint8Array {
  static random (opt ?: Partial<SignerConfig>) : SecretKey {
    // Return a random secret key.
    return new SecretKey(Buff.random(32), opt)
  }

  readonly config  : SignerConfig

  constructor (
    secret  : Bytes,
    options : Partial<SignerConfig> = {}
  ) {
    super(new Field(secret))
    this.config = { ...SIGNER_DEFAULT, ...options }
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
    return new Field(this)
  }

  get point () : Point {
    return this.field.point
  }

  get pub () : PublicKey {
    return new PublicKey(this.point.raw, this.config)
  }

  get hasEvenY () : boolean {
    return this.point.hasEvenY
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  get xcheck () : SecretKey {
    return (this.config.xonly && this.hasOddY)
      ? this.negate()
      : this
  }

  add (bytes : Bytes) : SecretKey {
    const field = this.xcheck.field
    return new SecretKey(field.add(bytes), this.config)
  }

  sub (bytes : Bytes) : SecretKey {
    const field = this.xcheck.field
    return new SecretKey(field.sub(bytes), this.config)
  }

  mul (bytes : Bytes) : SecretKey {
    const field = this.xcheck.field
    return new SecretKey(field.mul(bytes), this.config)
  }

  div (bytes : Bytes) : SecretKey {
    const field = this.xcheck.field
    return new SecretKey(field.div(bytes), this.config)
  }

  pow (bytes : Bytes) : SecretKey {
    const field = this.xcheck.field
    return new SecretKey(field.pow(bytes), this.config)
  }

  negate () : SecretKey {
    return new SecretKey(this.field.negate(), this.config)
  }

  sign (
    message : Bytes,
    options : Partial<SignerConfig> = this.config
  ) : Buff {
    return sign(this.raw, message, options)
  }

  verify (
    signature : Bytes,
    message   : Bytes,
    options   : Partial<SignerConfig> = this.config
  ) : boolean {
    return verify(signature, message, this.pub.raw, options)
  }

  toWIF (prefix = 0x80) : string {
    return Buff.join([ prefix, this, 0x01 ]).b58chk
  }
}

export class PublicKey extends Uint8Array {
  static random (opt ?: Partial<SignerConfig>) : PublicKey {
    // Return a random public key.
    return SecretKey.random(opt).pub
  }

  static fromSecret (
    bytes : Bytes,
    opt  ?: Partial<SignerConfig>
  ) : PublicKey {
    // Return a public key from a secret key.
    return new SecretKey(bytes, opt).pub
  }

  static xfilter = getXOnlyPub

  readonly config : SignerConfig

  constructor (
    pubkey  : Bytes,
    options : Partial<SignerConfig> = {}
  ) {
    // Initialize our key config.
    const config = { ...SIGNER_DEFAULT, ...options }

    // handle x-only key policy.
    if (config.xonly) {
      super(PublicKey.xfilter(pubkey))
    } else {
      super(Buff.bytes(pubkey))
    }
    // Save key configuration.
    this.config = config
  }

  get buff () : Buff {
    return (this.config.xonly)
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

  get hasEvenY () : boolean {
    return this.point.hasEvenY
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  add (key : Bytes | PublicKey) : PublicKey {
    const point = (key instanceof PublicKey)
      ? this.point.add(key.point)
      : this.point.add(key)
    return new PublicKey(point.raw, this.config)
  }

  sub (key : Bytes | PublicKey) : PublicKey {
    const point = (key instanceof PublicKey)
      ? this.point.sub(key.point)
      : this.point.sub(key)
    return new PublicKey(point.raw, this.config)
  }

  mul (key : Bytes | PublicKey) : PublicKey {
    const point = (key instanceof PublicKey)
      ? this.point.add(key.point)
      : this.point.add(key)
    return new PublicKey(point.raw, this.config)
  }

  negate () : PublicKey {
    return new PublicKey(this.point.negate().raw, this.config)
  }

  verify (
    signature : Bytes,
    message   : Bytes,
    options   : Partial<SignerConfig> = this.config
  ) : boolean {
    return verify(signature, message, this.raw, options)
  }
}

export const KeyPair = SecretKey
