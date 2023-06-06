import { Bytes } from '@cmdcode/buff-utils'

export interface KeyContext {
  qacc : Bytes
  gacc : bigint
  tacc : bigint
}

export interface MusigSession {
  nonces  : Bytes[] // 66 byte values
  pubkeys : Bytes[] // 33 byte values
  tweaks  : Bytes[] // 33 byte values
  message : Bytes
  options : Partial<MusigConfig>
}

export interface MusigConfig {
  aux    : Bytes
  xonly  : boolean
  throws : boolean
}
