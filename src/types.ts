import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Signer }      from './signer.js'

export interface PointData { x : bigint, y : bigint }

export type SignerAPI = Signer

export interface HDKey {
  prev   : Buff | null
  seckey : Buff | null
  pubkey : Buff
  path   : string
  code   : Buff
}

export interface ExtKey {
  prefix  : number
  depth   : number
  fprint  : number
  index   : number
  code    : string
  type    : number
  key     : string
  seckey ?: string
  pubkey  : string
}

export interface MusignContext {
  key_tweaks   ?: Bytes[]
  nonce_seeds  ?: Bytes[]
  nonce_tweaks ?: Bytes[]
  nonce_coeffs ?: Array<Bytes | null>
}

export interface SignerOptions {
  aux          ?: Bytes | null
  adaptor      ?: string
  nonce_tweaks ?: Bytes[]
  tweak        ?: Bytes
  throws       ?: boolean
}

export interface SignerConfig {
  hd_code  ?: Bytes
  hd_path  ?: string
  recovery ?: Bytes
}
