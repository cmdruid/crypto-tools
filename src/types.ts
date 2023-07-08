import { Signer } from './signer'

export type HashTypes  = 'sha256'  | 'sha512' | 'hash256' | 'ripe160' | 'hash160'
export type HmacTypes  = 'hmac256' | 'hmac512'

export interface PointData { x : bigint, y : bigint }

export interface SignerAPI extends Signer {}
