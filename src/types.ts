import { Buff }   from '@cmdcode/buff-utils'
import { Signer } from './signer.js'

export type HashTypes  = 'sha256'  | 'sha512' | 'hash256' | 'ripe160' | 'hash160'
export type HmacTypes  = 'hmac256' | 'hmac512'

export type HDKey = [ key : Buff, code : Buff ]

export interface PointData { x : bigint, y : bigint }

export interface SignerAPI extends Signer {}

export interface ExtendedKey {
  prefix : number
  depth  : number
  fprint : number
  index  : number
  code   : string
  type   : number
  key    : string
}
