import { Buff, Bytes } from '@cmdcode/buff-utils'

export type SignerConfig = Partial<SignerOptions>

export interface SignerState {
  recovery ?: Bytes
  xonly     : boolean
}

export interface SignerOptions {
  aux       : Bytes
  adaptor  ?: Bytes
  nonce    ?: Bytes
  recovery ?: Bytes
  tweak    ?: Bytes
  throws    : boolean
  xonly     : boolean
}

export const SIGNER_DEFAULTS : SignerOptions = {
  aux    : Buff.random(32),
  throws : false,
  xonly  : true
}

export function signer_defaults (
  config : SignerConfig = {}
) : SignerOptions {
  return { ...SIGNER_DEFAULTS, ...config  }
}
