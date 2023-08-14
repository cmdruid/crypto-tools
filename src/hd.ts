import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { hmac512 }      from './hash.js'
import { Field, Point } from './ecc.js'
import { get_pubkey }   from './keys.js'

import * as assert from './assert.js'

type Tweak = [ tweak: Bytes, hardened: boolean ]

const INT_REGEX  = /^[0-9]{0,10}$/,
      STR_REGEX  = /^[0-9a-zA-Z_&?=]{64}$/

export function derive (
  chain_path  : string,
  chain_key   : Bytes,
  chain_code ?: Bytes,
  is_private  = false
) : [ key : Buff, code : Buff ] {
  // Assert the key path is valid.
  assert.valid_path(chain_path)
  // Check if this is the master path.
  const is_m = chain_path.startsWith('m')
  // Assert no conflicts between path and chain.
  assert.valid_chain(chain_path, chain_code)
  // Prepare the chain code.
  let code = (chain_code !== undefined)
    ? Buff.bytes(chain_code)
    : Buff.str('Bitcoin seed')
  // Prepare the key data.
  let key = Buff.bytes(chain_key)
  // If this is a master path:
  if (is_m) {
    // Generate the root.
    const root = generate_code(code, key)
    key  = Buff.raw(root[0])
    code = Buff.raw(root[1])
    is_private = true
  }

  // Derive paths for key tweaking.
  const paths = parse_path(chain_path)

  // For each path segment:
  for (const [ tweak, is_hardened ] of paths) {
    // Format our bytes based on path state.
    const bytes = compute_tweak(key, tweak, is_hardened, is_private)
    // Compute the next chaincode iteration.
    const [ next_key, next_code ] = generate_code(code, bytes)
    // Set the current code to the new value.
    code = Buff.raw(next_code)
    // Set the new key as an added tweak of the current key.
    if (is_private) {
      key = Field.mod(key).add(next_key).buff
      assert.in_field(key.big, true)
    } else {
      key = Point.from_x(key).add(next_key).buff
      assert.on_curve(key.slice(1).big)
    }
  }

  return [ key, code ]
}

function compute_tweak (
  key   : Bytes,
  tweak : Bytes,
  is_hardened = false,
  is_private  = false
) : Buff {
  // Assert the deriviation state is valid.
  assert.valid_derive_state(is_hardened, is_private)
  // Assert the key size is valid.
  if (is_private) {
    assert.size(key, 32)
  } else {
    assert.size(key, 33)
  }
  // Return our tweak based on the input and state.
  if (is_hardened && is_private) {
    return Buff.join([ 0x00, key, tweak ])
  } else if (is_private) {
    return Buff.join([ get_pubkey(key, false), tweak ])
  } else {
    return Buff.join([ key, tweak ])
  }
}

function parse_path (
  fullpath : string
) : Tweak[] {
  const tweaks : Tweak[] = []

  let paths = fullpath.split('/')

  if (paths[0] === 'm' || paths[0] === '') {
    // Remove invalid characters.
    paths = paths.slice(1)
  }

  for (let path of paths) {
      let is_hardened = false

    if (path.slice(-1) === '\'') {
      is_hardened = true
      path = path.slice(0, -1)
    }

    if (path.match(INT_REGEX) !== null) {
      let index = parseInt(path, 10)
      assert.valid_index(index)
      if (is_hardened) index += 0x80000000
      tweaks.push([ Buff.num(index, 4), is_hardened ])
    } else if (path.match(STR_REGEX) !== null) {
      let index = Buff.str(path)
      if (is_hardened) index = index.prepend(0x80)
      tweaks.push([ index.digest, is_hardened ])
    } else {
      throw new Error('Invalid path segment:' + path)
    }
  }

  return tweaks
}

function generate_code (
  chain : Uint8Array,
  data  : Uint8Array
) : Uint8Array[] {
  /* Perform a SHA-512 operation on the provided key,
   * then an HMAC signing operation using the chain code.
   */
  const I  = hmac512(chain, data),
        IL = I.slice(0, 32),
        IR = I.slice(32)
  // Return each half of the hashed result in an array.
  return [ IL, IR ]
}
