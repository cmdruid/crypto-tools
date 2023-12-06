/** Resources
 *  - https://github.com/grempe/secrets.js
 *  - https://github.com/renproject/frost
 *  - https://github.com/taurusgroup/multi-party-sig
 *  - https://eprint.iacr.org/2020/852.pdf
 */

import { Buff, Bytes }  from '@cmdcode/buff'
import { _0n, _1n, _N } from '../const.js'
import { Field }        from './ecc.js'

import {
  fd,
  invert,
  mod_n
} from './math.js'

export function create_shares (
  secret : Bytes,
  thold  : number,
  total  : number
) : Buff[] {
  // Init the coefficient array using our secret.
  const coeffs = [ Field.mod(secret).big ]
  // For the remaining number of shares we want as our threshold:
  for (let i = 1; i < thold; i++) {
    // Randomly generate a bigint value.
    const rand = Buff.random(32).big
    // Modulo the value and add to our array.
    coeffs.push(mod_n(rand))
  }
  // Init the shares array.
  const shares : Buff[] = []
  // For the total number of shares planned:
  for (let i = 1; i <= total; i++) {
    // Start our result value at 0.
    let result = _0n
    // For each coefficient:
    coeffs.forEach((coeff, index) => {
      // Compute the index multiplier.
      const idx = BigInt(i) ** BigInt(index)
      // Add the product of the coefficient and multipler.
      result += fd.mul(coeff, idx)
    })
    // Combine the index and share secret.
    const index = Buff.num(i, 4)
    const value = Buff.big(result, 33)
    const share = Buff.join([ index, value ])
    // Push the result to the shares array.
    shares.push(share)
  }
  // Return the shares array.
  return shares
}

export function combine_shares (
  shares : Bytes[]
) : Buff {
  const entries = shares.map(e => {
    const bytes = Buff.bytes(e)
    const index = bytes.subarray(0, 4).big
    const value = bytes.subarray(4).big
    return [ index, value ]
  })
  // Init the secret at 0.
  let secret = _0n
  // For each share:
  for (let i = 0; i < entries.length; i++) {
    // Init the ratio at 1 / 1.
    let numer = _1n
    let denom = _1n
    // For each share:
    for (let j = 0; j < entries.length; j++) {
      // If the indices are not equal:
      if (i !== j) {
        // Apply share values and formula to the current ratio.
        numer = (numer * -entries[j][0]) % _N
        denom = (denom * (entries[i][0] - entries[j][0])) % _N
      }
    }

    // Correct any negative numbers.
    if (numer < _0n) numer += _N
    if (denom < _0n) denom += _N

    // Compute the lagrange coefficient.
    const coeff = (entries[i][1] * numer * invert(denom, _N)) % _N
    // Apply the coefficient to the current secret value.
    secret = (secret + coeff) % _N
  }
  // Return the total secret value.
  return Buff.big(secret, 32)
}
