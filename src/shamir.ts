/** Resources
 *  - https://github.com/grempe/secrets.js
 *  - https://github.com/renproject/frost
 *  - https://github.com/taurusgroup/multi-party-sig
 *  - https://eprint.iacr.org/2020/852.pdf
 */

import { Buff, Bytes }  from '@cmdcode/buff'
import { _0n, _1n, _N } from './const.js'
import { Field }        from './ecc.js'

import {
  fd,
  invert,
  mod_n
} from './math.js'

type SecretShare = [
  index : bigint,
  value : bigint
]

export function create_shares (
  secret : Bytes,
  thold  : number,
  total  : number
) : SecretShare[] {
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
  const shares : SecretShare[] = []
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
    // Push the result to the shares array.
    shares.push([ BigInt(i), result ])
  }
  // Return the shares array.
  return shares
}

export function combine_shares (
  shares : SecretShare[]
) : Buff {
  // Init the secret at 0.
  let secret = _0n
  // For each share:
  for (let i = 0; i < shares.length; i++) {
    // Init the ratio at 1 / 1.
    let numer = _1n
    let denom = _1n
    // For each share:
    for (let j = 0; j < shares.length; j++) {
      // If the indices are not equal:
      if (i !== j) {
        // Apply share value to the current ratio.
        numer = (numer * -shares[j][0]) % _N
        denom = (denom * (shares[i][0] - shares[j][0])) % _N
      }
    }
    // Correct any negative numbers.
    if (numer < _0n) numer += _N
    if (denom < _0n) denom += _N
    // Compute the lagrange coefficient.
    const coeff = (shares[i][1] * numer * invert(denom, _N)) % _N
    // Apply the coefficient to the current secret value.
    secret = (secret + coeff) % _N
  }
  // Return the total secret value.
  return Buff.big(secret, 32)
}

// function invert (
//   a : bigint,
//   m : bigint
// ) : bigint {
//   if (m === _1n) return _0n
//   const m0 = m
//     let x0 = _0n
//       , x1 = _1n

//   while (a > _1n) {
//     let q = a / m;
//     [ m, a ] = [ a % m, m ];
//     [ x0, x1 ] = [ x1 - q * x0, x0 ]
//   }

//   return x1 < _0n ? x1 + m0 : x1
// }
