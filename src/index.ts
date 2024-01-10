import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'

export const noble = { secp, schnorr }

export * from './lib/ecc.js'
export * from './types.js'

export * as assert from './assert.js'
export * as cipher from './lib/cipher.js'
export * as CONST  from './const.js'
export * as hash   from './lib/hash.js'
export * as hd     from './lib/hd.js'
export * as keys   from './lib/keys.js'
export * as math   from './lib/math.js'
export * as merkle from './lib/merkle.js'
export * as signer from './lib/sig.js'
export * as shamir from './lib/shamir.js'
export * as util   from './util.js'
