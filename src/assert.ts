import { Buff, Bytes } from '@cmdcode/buff-utils'
import { fail }  from './utils.js'
import { CONST } from './math.js'

const { N, P, _0n } = CONST

export function size (
  input   : Bytes,
  size    : number,
  throws ?: boolean
) : boolean {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    return fail(`Invalid byte size: ${bytes.hex} !== ${size}`, throws)
  }
  return true
}

export function exists <T> (
  input  ?: T
) : asserts input is T {
  if (typeof input === 'undefined') {
    throw new TypeError('Input is undefined!')
  }
}

export function on_curve (
  x       : bigint,
  throws ?: boolean
) : boolean {
  if (!(typeof x === 'bigint' && _0n < x && x < P)) {
    fail('x value is not on the curve!', throws)
  }
  return true
}

export function in_field (
  x       : bigint,
  throws ?: boolean
) : boolean {
  if (!(typeof x === 'bigint' && _0n < x && x < N)) {
    fail('x value is not in the field!', throws)
  }
  return true
}
