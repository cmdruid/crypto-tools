import { Buff, Bytes }   from '@cmdcode/buff'
import { Field, FpSqrt } from '@noble/curves/abstract/modular'
import { mod, pow }      from '@noble/curves/abstract/modular'
import { _N, _P, _0n }   from '../const.js'

export {
  mod,
  pow,
  pow2,
  invert,
} from '@noble/curves/abstract/modular'

export * as pt from './point.js'

export const fd = Field(_N, 32, true)
export const GF = Field

export const mod_n  = (x : bigint) : bigint => mod(x, _N)
export const mod_p  = (x : bigint) : bigint => mod(x, _P)
export const pow_n  = (x : bigint, exp : bigint) : bigint => pow(x, exp, _N)

export const sqrt_n = FpSqrt(_N)
export const sqrt_p = FpSqrt(_P)

export const on_curve = (x : bigint) : boolean => {
  return typeof x === 'bigint' && _0n < x && x < _P
}
export const in_field = (x : bigint) : boolean => {
  return typeof x === 'bigint' && _0n < x && x < _N
}

export function mod_bytes (bytes : Bytes) : Buff {
  const b = Buff.bytes(bytes).big
  return Buff.big(mod_n(b), 32)
}
