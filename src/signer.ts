import { Buff, Bytes }    from '@cmdcode/buff-utils'
import { Field }          from './ecc.js'
import { hmac }           from './hash.js'
import { sign, verify }   from './schnorr.js'
import { SignerConfig }   from './schema/types.js'
import { SIGNER_DEFAULT } from './schema/defaults.js'
import { pow } from './math.js'
import { getSharedKey } from './utils.js'

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
    msg  : Bytes,
    opt ?: Partial<SignerConfig>
  ) : string {
    return sign(this._secret, msg, opt).hex
  }
}
