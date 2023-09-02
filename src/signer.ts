import { Buff, Bytes }    from '@cmdcode/buff-utils'
import { derive }         from './hd.js'
import { hmac512 }        from './hash.js'
import { get_shared_key } from './ecdh.js'

import {
  gen_seckey,
  get_seckey,
  get_pubkey
} from './keys.js'

import {
  sign,
  gen_nonce,
  verify
} from './sig.js'

import * as assert from './assert.js'

import {
  SignerConfig,
  SignerOptions
} from './types.js'

const MSG_MIN_VALUE = 0xFFn ** 24n

export class Signer {
  static generate (
    config ?: SignerConfig
  ) : Signer {
    const sec = gen_seckey()
    return new Signer(sec, config)
  }

  static verify = verify

  readonly _pubkey : Buff
  readonly _seckey : Buff
  readonly _chain ?: Buff
  readonly _config : SignerConfig

  constructor (
    secret : Bytes,
    config : SignerConfig = {}
  ) {
    const { hd_path, hd_code } = config
    if (typeof hd_path === 'string') {
      // Derive new key and code from path.
      const { seckey, code } = derive(hd_path, secret, hd_code, true)
      // Assert that the secret key exists.
      assert.exists(seckey)
      // Apply new key as secret.
      secret = seckey
      // Apply new chain code to config.
      this._chain = code
    }

    this._seckey = get_seckey(secret)
    this._pubkey = get_pubkey(this._seckey, true)
    this._config = config
  }

  get pubkey () : Buff {
    return this._pubkey
  }

  _gen_nonce (opt ?: SignerOptions) : (msg : Bytes) => Buff {
    const config = { aux: null, ...this._config, ...opt }
    return (msg : Bytes) : Buff => {
      return gen_nonce(msg, this._seckey, config)
    }
  }

  _signer (opt ?: SignerOptions) : (msg : Bytes) => Buff {
    const config = { ...this._config, ...opt }
    return (msg : Bytes) : Buff => {
      assert.size(msg, 32)
      assert.min_value(msg, MSG_MIN_VALUE)
      return sign(msg, this._seckey, config)
    }
  }

  derive (path : string) : Signer {
    const config = { ...this._config, path }
    return new Signer(this._seckey, config)
  }

  ecdh (pubkey : Bytes) : Buff {
    return get_shared_key(this._seckey, pubkey)
  }

  hmac (message : Bytes) : Buff {
    return hmac512(this._seckey, message)
  }

  gen_nonce (
    message  : Bytes,
    options ?: SignerOptions
  ) : Buff {
    const sn = this._gen_nonce(options)(message)
    return get_pubkey(sn, true)
  }

  sign (
    message  : Bytes,
    options ?: SignerOptions
  ) : Buff {
    return this._signer(options)(message)
  }
}
