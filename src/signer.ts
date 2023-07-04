import { Buff, Bytes }    from '@cmdcode/buff-utils'
import { Field }          from './ecc.js'
import { hmac }           from './hash.js'
import { sign, verify }   from './schnorr.js'
import { pow }            from './math.js'
import { getSharedKey }   from './utils.js'

import {
  signer_defaults,
  SignerConfig,
  SignerOptions
} from './config/signer.js'

export class Signer {
  static random = Buff.random
  static verify = verify

  readonly _secret : Field
  readonly opt     : SignerOptions

  constructor (
    secret  : Bytes,
    config ?: SignerConfig
  ) {
    this._secret = new Field(secret).negated
    this.opt = signer_defaults(config)
  }

  get pubkey () : string {
    return this._secret.point.x.hex
  }

  // How can we fit an HD wallet in here?
  generate (path : Bytes) : Signer {
    const sec = this.hmac(path)
    return new Signer(sec, this.opt)
  }

  getSharedKey (pubkey : Bytes) : string {
    return getSharedKey(this._secret, pubkey).hex
  }

  hmac (msg : Bytes) : string {
    return hmac(this._secret, msg).hex
  }

  musign (
    challenge : Bytes,
    nonces    : Bytes[],
    vectors   : Bytes[]
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
    return sign(this._secret, message, config).hex
  }
}
