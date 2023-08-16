import { Buff } from '@cmdcode/buff-utils'

export interface PointData { x : bigint, y : bigint }

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
