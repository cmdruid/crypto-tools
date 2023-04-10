import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { sign, SignatureType, verify } from './signer.js'
import { getXOnlyPub } from './utils.js'

type KeyOptions = Partial<KeyConfig>

interface KeyConfig {
  type : SignatureType
}

const DEFAULT_CONFIG : KeyConfig = {
  type: 'ecdsa'
}

export class SecretKey extends Uint8Array {
  static random (opt ?: KeyOptions) : SecretKey {
    // Return a random secret key.
    return new SecretKey(Buff.random(32), opt)
  }

  readonly config : KeyConfig
  readonly xonly  : boolean

  constructor (
    secret  : Bytes,
    options : KeyOptions = {}
  ) {
    super(new Field(secret))
    this.config = { ...DEFAULT_CONFIG, ...options }
    this.xonly  = this.config.type === 'taproot'
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

  get xfilter () : SecretKey {
    return (this.xonly && this.hasOddY)
      ? this.negate()
      : this
  }

  add (bytes : Bytes) : SecretKey {
    const field = this.xfilter.field
    return new SecretKey(field.add(bytes), this.config)
  }

  sub (bytes : Bytes) : SecretKey {
    const field = this.xfilter.field
    return new SecretKey(field.sub(bytes), this.config)
  }

  mul (bytes : Bytes) : SecretKey {
    const field = this.xfilter.field
    return new SecretKey(field.mul(bytes), this.config)
  }

  div (bytes : Bytes) : SecretKey {
    const field = this.xfilter.field
    return new SecretKey(field.div(bytes), this.config)
  }

  pow (bytes : Bytes) : SecretKey {
    const field = this.xfilter.field
    return new SecretKey(field.pow(bytes), this.config)
  }

  negate () : SecretKey {
    return new SecretKey(this.field.negate(), this.config)
  }

  async sign (
    message : Bytes,
    type = this.config.type
  ) : Promise<Uint8Array> {
    return sign(this.raw, message, type)
  }

  async verify (
    signature : Bytes,
    message   : Bytes,
    type = this.config.type
  ) : Promise<boolean> {
    return verify(signature, message, this.pub.raw, type)
  }

  toWIF (prefix = 0x80) : string {
    return Buff.join([prefix, this, 0x01]).b58chk
  }
}

export class PublicKey extends Uint8Array {
  static random (opt : KeyOptions) : PublicKey {
    // Return a random public key.
    return SecretKey.random(opt).pub
  }

  static fromSecret (bytes : Bytes, opt : KeyOptions) : PublicKey {
    // Return a public key from a secret key.
    return new SecretKey(bytes, opt).pub
  }

  static xfilter = getXOnlyPub

  readonly config : KeyConfig
  readonly xonly  : boolean

  constructor (
    pubkey  : Bytes,
    options : KeyOptions = {}
  ) {
    // Initialize our key config.
    const config = { ...DEFAULT_CONFIG, ...options }
    // handle x-only key policy.
    if (config.type === 'taproot') {
      super(PublicKey.xfilter(pubkey), 32)
    } else {
      super(Buff.bytes(pubkey), 33)
    }
    // Save key configuration.
    this.config = { ...DEFAULT_CONFIG, ...options }
    this.xonly  = config.type === 'taproot'
  }

  get buff () : Buff {
    return (this.xonly) ? this.x : new Buff(this)
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

  add (bytes : Bytes) : PublicKey {
    return new PublicKey(this.point.add(bytes).raw, this.config)
  }

  sub (bytes : Bytes) : PublicKey {
    return new PublicKey(this.point.sub(bytes).raw, this.config)
  }

  mul (bytes : Bytes) : PublicKey {
    return new PublicKey(this.point.mul(bytes).raw, this.config)
  }

  negate () : PublicKey {
    return new PublicKey(this.point.negate().raw, this.config)
  }

  async verify (
    signature : Bytes,
    message   : Bytes,
    type = this.config.type
  ) : Promise<boolean> {
    return verify(signature, message, this.raw, type)
  }
}

export const KeyPair = SecretKey
