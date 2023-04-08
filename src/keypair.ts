import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { sign, verify } from './signer.js'
import { KeyUtil }      from './utils.js'

type KeyType    = 'ecdsa' | 'schnorr'
type KeyOptions = Partial<KeyConfig>

interface KeyConfig {
  type  : KeyType
  xonly : boolean
}

const DEFAULT_CONFIG : KeyConfig = {
  type  : 'schnorr',
  xonly : false
}

export class SecretKey extends Uint8Array {
  static random (opt ?: KeyOptions) : SecretKey {
    // Return a random secret key.
    return new SecretKey(Buff.random(32), opt)
  }

  readonly config : KeyConfig

  constructor (
    secret  : Bytes,
    options : KeyOptions = {}
  ) {
    super(new Field(secret))
    this.config = { ...DEFAULT_CONFIG, ...options }
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
    return (this.config.xonly)
      ? new PublicKey(this.point.rawX, this.config)
      : new PublicKey(this.point.raw, this.config)
  }

  get hasEvenY () : boolean {
    return this.point.hasEvenY
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  get xfilter () : SecretKey {
    return (this.config.xonly && this.hasOddY)
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

  static xOnly = KeyUtil.xOnlyPub

  readonly config : KeyConfig

  constructor (
    pubkey  : Bytes,
    options : KeyOptions = {}
  ) {
    // Initialize our key config.
    const config = { ...DEFAULT_CONFIG, ...options }
    // If enabled, enforce xonly policy.
    if (config.xonly) pubkey = PublicKey.xOnly(pubkey)
    // Validate public key.
    const bytes = new Point(pubkey).raw
    // Create key as raw compressed point.
    super(bytes, 33)
    // Save key configuration.
    this.config = { ...DEFAULT_CONFIG, ...options }
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

  get point () : Point {
    return new Point(this)
  }

  get buffX () : Buff {
    return PublicKey.xOnly(this.raw)
  }

  get rawX () : Uint8Array {
    return this.buffX.raw
  }

  get hexX () : string {
   return this.buffX.hex
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
