import { Bytes } from '@cmdcode/buff-utils'

export interface SignerConfig {
  type   : 'ecdsa' | 'schnorr'
  xonly  : boolean
  aux   ?: Bytes
  nonce ?: Bytes
  throws : boolean
}
