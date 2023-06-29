import { Bytes } from '@cmdcode/buff-utils'

export interface SignerConfig {
  type     : 'ecdsa' | 'schnorr'
  xonly    : boolean
  adaptor ?: Bytes
  aux     ?: Bytes
  nonce   ?: Bytes
  throws   : boolean
  tweak   ?: Bytes
}
