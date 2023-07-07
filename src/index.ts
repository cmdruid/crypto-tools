import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'

export const noble = { secp, schnorr }

export * from './hash.js'
export * from './ecc.js'
export * from './config.js'
export * as sig  from './sig.js'
export * as math from './math.js'
export * as util from './utils.js'
