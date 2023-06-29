import { Buff, Bytes }    from '@cmdcode/buff-utils'
import { Field }          from './ecc.js'
import { hmac }           from './hash.js'
import { sign, verify }   from './schnorr.js'
import { SignerConfig }   from './schema/types.js'
import { SIGNER_DEFAULT } from './schema/defaults.js'

export class Signer {
  static random = Buff.random
  static verify = verify

  readonly _secret : Field
  readonly opt     : SignerConfig

  constructor (
    secret : Bytes,
    config : Partial<SignerConfig> = {}
  ) {
    this._secret = new Field(secret).negated
    this.opt = { ...SIGNER_DEFAULT, ...config }
  }

  get pubkey () : string {
    return this._secret.point.x.hex
  }

  generate (path : Bytes) : Signer {
    const sec = this.hmac(path)
    return new Signer(sec, this.opt)
  }

  hmac (msg : Bytes) : string {
    return hmac(this._secret, msg).hex
  }

  sign (
    msg  : Bytes,
    opt ?: Partial<SignerConfig>
  ) : string {
    return sign(this._secret, msg, opt).hex
  }
}
