import { Buff, Bytes } from '@cmdcode/buff'

export type Literal    = (string | number | boolean | null)
export type CipherType = 'AES-CBC' | 'AES-GCM'
export type MerkleTree = Array<string | string[]>

export type MerkleData = [
  root   : string,
  target : string | null,
  path   : string[]
]

export interface PointData { x : bigint, y : bigint }

export interface KeyLink {
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

export interface ProofData {
  ref    : string
  pub    : string
  pid    : string
  sig    : string
  params : string[][]
}

export interface SignedEvent {
  pubkey     : string
  created_at : number
  id         : string
  sig        : string
  kind       : number
  content    : string
  tags       : Literal[][]
}

export interface SignOptions {
  aux          ?: Bytes | null
  adaptor      ?: Bytes
  key_tweak    ?: Bytes
  nonce_seed   ?: Bytes
  nonce_tweak  ?: Bytes
  sec_nonce    ?: Bytes
  throws       ?: boolean
}
