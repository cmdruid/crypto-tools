/** Resources
 *  - https://github.com/grempe/secrets.js
 *  - https://github.com/renproject/frost
 *  - https://github.com/taurusgroup/multi-party-sig
 *  - https://eprint.iacr.org/2020/852.pdf
 */

import { Buff, Bytes } from '@cmdcode/buff'

import { _0n, _1n, _N }    from './const.js'
import { Field } from './ecc.js'

import { fd, mod_n } from './math.js'


export function create_shares (
  secret : Bytes,
  thold  : number,
  total  : number
) : Buff[] {
  // Init our coefficient array using our secret.
  const coeffs = [ Field.mod(secret).big ]
  // For the remaining number of shares we want as our threshold:
  for (let i = 1; i < thold; i++) {
    // Randomly generate the values up to our threshold.
    coeffs.push(mod_n(Buff.random(32).big))
  }
  
  const shares : Buff[] = []
  
  for (let i = 1; i <= total; i++) {
    // Init our result as 0.
    let result = _0n
    // For each coefficient:
    coeffs.forEach((coeff, index) => {
      // Compute the index multiplier.
      const idx = BigInt(i) ** BigInt(index)
      // Add the product of the coefficient and multipler.
      result += fd.mul(coeff, idx)
    })
    // Push the sum to the shares array.
    shares.push(Buff.big(result, 32))
  }
  // Return the shares array.
  return shares
}

function combine_shares (
  shares : [number, bigint][], 
  thold  : number
) : Buff {
  let secret = BigInt(0)

  for (let i = 0; i < thold; i++) {
    let numer = _1n
    let denom = _1n
    
    for (let j = 0; j < thold; j++) {
      if (i !== j) {
        numer = (numer * -BigInt(shares[j][0])) % _N
        denom = (denom * (BigInt(shares[i][0]) - BigInt(shares[j][0]))) % _N
      }
    }

    const y = shares[i][1]

    const lagrangeTerm = (y * numer * inverse(denom)) % _N
    secret = (_N + secret + lagrangeTerm) % _N
  }

  return secret
}

function inverse (
  a : bigint,
  m = _N
) : bigint {
  if (m === _1n) return _0n
  let m0 = m, x0 = _0n, x1 = _1n

  while (a > _1n) {
    let q = a / m
    [ m, a  ] = [ a % m, m ]
    [ x0, x1] = [ x1 - q * x0, x0 ]
  }

  return x1 < _0n ? x1 + m0 : x1
}

// Example usage:
// (async () => {
//   const secret = BigInt(123); // Our secret as a BigInt
//   const totalShares = 5; // Number of shares to create
//   const threshold = 3; // Minimum shares required to reconstruct the secret

//   const shares = await createShares(secret, totalShares, threshold);
//   console.log("Shares created: ", shares);

//   const reconstructedSecret = reconstructSecret(shares.slice(0, threshold), threshold);
//   console.log("Reconstructed secret: ", reconstructedSecret);
// })();
