import { Bytes } from '@cmdcode/buff'

export type SignOptions = Partial<SignConfig>

export interface SignConfig {
  aux          ?: Bytes | null
  adaptors      : Bytes[]
  key_tweaks    : Bytes[]
  nonce_tweaks  : Bytes[]
  recovery_key ?: Bytes
  throws        : boolean
  xonly         : boolean
}

const SIGN_DEFAULTS : SignConfig = {
  adaptors     : [],
  key_tweaks   : [],
  nonce_tweaks : [],
  throws       : false,
  xonly        : true
}

export function get_config (
  config : SignOptions = {}
) : SignConfig {
  return { ...SIGN_DEFAULTS, ...config  }
}
