import { Buff, Bytes } from '@cmdcode/buff'
import { _N, _P, _0n } from './const.js'

export function ok (value : unknown, message ?: string) : asserts value {
  if (value === false) throw new Error(message ?? 'Assertion failed!')
}

export function fail (
  error  : string,
  throws = false
) : boolean {
  if (!throws) return false
  throw new Error(error)
}

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
  input ?: T | null
) : asserts input is NonNullable<T> {
  if (typeof input === 'undefined') {
    throw new TypeError('Input is undefined!')
  }
  if (input === null) {
    throw new TypeError('Input is null!')
  }
}

export function on_curve (
  x       : bigint,
  throws ?: boolean
) : boolean {
  if (!(typeof x === 'bigint' && _0n < x && x < _P)) {
    fail('x value is not on the curve!', throws)
  }
  return true
}

export function in_field (
  x       : bigint,
  throws ?: boolean
) : boolean {
  if (!(typeof x === 'bigint' && _0n < x && x < _N)) {
    fail('x value is not in the field!', throws)
  }
  return true
}

export function valid_chain (
  path  : string,
  code ?: Bytes
) : void {
  if (code === undefined) {
    if (!path.startsWith('m')) {
      throw new Error('You need to specify a chain-code for a non-root path.')
    }
  } else {
    if (Buff.bytes(code).length !== 32) {
      throw new Error('Chain code must be 32 bytes!')
    }
  }
}

export function valid_path (path : string) : void {
  const regex = /^(m)?(\/)?(\w+'?\/)*\w+'?$/
  if (path !== '' && path.match(regex) === null) {
    throw new Error('Provided path string is invalid: ' + path)
  }
}

export function valid_hash (hash : string) : void {
  const regex = /^[0-9a-fA-F]{64}$/
  if (hash.match(regex) === null) {
    throw new Error('Provided hash string is invalid: ' + hash)
  }
}

export function valid_index (index : number) : void {
  if (index > 0x80000000) {
    throw new TypeError('Index value must not exceed 31 bits.')
  }
}

export function valid_pubkey (pubkey : Bytes) : void {
  const key = Buff.bytes(pubkey)
  if (key.length !== 33) {
    throw new TypeError('Index value must not exceed 31 bits.')
  }
}

export function valid_derive_state (
  hardened   : boolean,
  is_private : boolean
) : void {
  if (hardened && !is_private) {
    throw new Error('Cannot derive hardedened paths when is_private is false!')
  }
}
