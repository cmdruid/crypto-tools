import { Buff, Bytes } from '@cmdcode/buff-utils'

export type SignerConfig = Partial<SignerOptions>
export type SharedConfig = Partial<SharedOptions>

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

export interface SharedOptions {
  aux    ?: Bytes
  even_y  : boolean
  tag     : string
  xonly   : boolean
}

export const SIGNER_DEFAULTS : SignerOptions = {
  aux    : Buff.random(32),
  throws : false,
  xonly  : true
}

export const SHARED_DEFAULTS : SharedOptions = {
  xonly  : false,
  even_y : false,
  tag    : 'ecdh/shared'
}

export function signer_defaults (
  config : SignerConfig = {}
) : SignerOptions {
  return { ...SIGNER_DEFAULTS, ...config  }
}

export function shared_defaults (
  config : SharedConfig = {}
) : SharedOptions {
  return { ...SHARED_DEFAULTS, ...config  }
}
