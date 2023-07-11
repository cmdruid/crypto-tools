import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'

import * as keys from './keys.js'
import * as sign from './sig.js'

export const noble = { secp, schnorr }

export { derive } from './derive.js'

export * from './config.js'
export * from './ecc.js'
export * from './hash.js'

export * as math   from './math.js'
export * as util   from './utils.js'

export const ecc = { ...keys, ...sign }
