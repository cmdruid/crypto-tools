import { Bytes } from '@cmdcode/buff'

export type SignOptions = Partial<SignConfig>

export interface SignConfig {
  aux          ?: Bytes | null
  adaptor      ?: Bytes
  key_tweak    ?: Bytes
  nonce_tweak  ?: Bytes
  recovery_key ?: Bytes
  throws        : boolean
}

const SIGN_DEFAULTS : SignConfig = {
  throws: false,
}

export function get_config (
  config : SignOptions = {}
) : SignConfig {
  return { ...SIGN_DEFAULTS, ...config  }
}
