import { Buff } from '@cmdcode/buff'
import { Field, Point } from '../../src/index.js'

// Suppose a prover P wants to convince a verifier V 
// that they know x and r such that: C = g^x * h^r

// First, generate our x and r values.
const x = 'deadbeef'.repeat(4)
const r = 'decafeed'.repeat(4)

// Then, we need to compute C.

// Pick a random secret nonce k.
const k = Buff.random(32)
// We need a second point (H) to be used as a generator.
const H = Point.generate(k)
// Now we can calculate C.
const C = Point.generate(x).add(H.mul(r))

// We also need to compute a second value A.

// Pick a random value a.
const a = Buff.random(32)
// Pick a random value b.
const b = Buff.random(32)
// Now we can compute A.
const A = Point.generate(a).add(H.mul(b))

// Verifier generates a challenge c.
const c = Buff.random(32)

// The prover calculates responses z1 = a + cx and z2 = b + cr.
const z1 = Field.mod(c).mul(x).add(a)
const z2 = Field.mod(c).mul(r).add(b)

// The verfifer checks that A equals g^z1 * h^z2 = C^c * A.
const Z1  = Point.generate(z1)
const Z2  = H.mul(z2)
const C_v = C.mul(c)
const v_1 = Z1.add(Z2)
const v_2 = C_v.add(A)

console.log('v_1:', v_1.hex)
console.log('V_2:', v_2.hex)
console.log('isValid:', v_1.hex === v_2.hex)