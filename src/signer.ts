import { Buff, Bytes }   from '@cmdcode/buff-utils'
import { Field }         from './ecc.js'
import { hmac512 }       from './hash.js'
import { pow }           from './math.js'

import {
  sign,
  recover,
  verify
} from './sig.js'

import {
  getSharedKey,
  getSharedCode
} from './keys.js'

import {
  signer_defaults,
  SignerConfig,
  SignerState
} from './config.js'

export class Signer {
  static random = Buff.random
  static verify = verify

  readonly _secret : Field
  readonly _state  : SignerState

  constructor (
    secret  : Bytes,
    config ?: SignerConfig
  ) {
    const { recovery, xonly } = signer_defaults(config)
    const field  = new Field(secret)
    this._state  = { recovery, xonly }
    this._secret = (this.xonly) ? field.negated : field
  }

  get pubkey () : string {
    return (this.xonly)
      ? this._secret.point.x.hex
      : this._secret.point.hex
  }

  get xonly () : boolean {
    return this._state.xonly
  }

  getSharedKey (pubkey : Bytes) : string {
    return getSharedKey(this._secret, pubkey).hex
  }

  getSharedCode (pubkey : Bytes) : string {
    return getSharedCode(this._secret, pubkey).hex
  }

  hmac (msg : Bytes) : string {
    return hmac512(this._secret, msg).hex
  }

  musign (
    challenge : Bytes,
    nonces    : Bytes[],
    vectors   : [ key_vec : Bytes, nonce_vec: Bytes ]
  ) : string {
    const [ kv, nv ] = vectors.map(e => Buff.bytes(e).big)
    const c = Buff.bytes(challenge).big
    let s = this._secret.mul(c * kv).big
    for (let j = 0; j < nonces.length; j++) {
      // Set our nonce value for the round.
      const r = Buff.bytes(nonces[j]).big
      // Compute our nonce vector.
      const c = pow(nv, BigInt(j), Field.N)
      // Apply the nonce and vector tweak.
      s += (r * c)
      // Squash our signature back into the field.
      s = s % Field.N
    }
    return Buff.big(s, 32).hex
  }

  sign (
    message : Bytes,
    config ?: SignerConfig
  ) : string {
    config = { ...this._state, ...config }
    return sign(this._secret, message, config).hex
  }

  recover (
    signature : Bytes,
    message   : Bytes,
    pubkey    : Bytes
  ) : Buff {
    return recover(signature, message, pubkey, this._secret)
  }
}
