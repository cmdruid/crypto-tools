import { Buff, Bytes } from '@cmdcode/buff-utils'

export type SignerConfig = Partial<SignerOptions>

export interface SignerOptions {
  type     : 'ecdsa' | 'schnorr'
  xonly    : boolean
  adaptor ?: Bytes
  aux     ?: Bytes
  nonce   ?: Bytes
  throws   : boolean
  tweak   ?: Bytes
}

export const SIGNER_DEFAULTS : SignerOptions = {
  aux    : Buff.random(32),
  type   : 'schnorr',
  throws : false,
  xonly  : false
}

export function signer_defaults (
  config : SignerConfig = {}
) : SignerOptions {
  return { ...SIGNER_DEFAULTS, ...config  }
}
