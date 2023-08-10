import { Buff, Bytes } from '@cmdcode/buff-utils'

export type SignOptions = Partial<SignConfig>

export interface SignConfig {
  aux       : Bytes
  adaptor  ?: Bytes
  nonce    ?: Bytes
  recovery ?: Bytes
  tweak    ?: Bytes
  throws    : boolean
  xonly     : boolean
}

const SIGN_DEFAULTS : SignConfig = {
  aux    : Buff.random(32),
  throws : false,
  xonly  : true
}

export function sign_config (
  config : SignOptions = {}
) : SignConfig {
  return { ...SIGN_DEFAULTS, ...config  }
}
