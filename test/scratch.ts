import { Buff }  from '@cmdcode/bytes-utils'

// Test that two keypairs can derive a shared secret.
import * as ECC  from '../src/ecc.js'
import * as Rand from '../src/rand.js'

const { Field, Point } = ECC

// Define seed values for keys (a) and (k).
const seedA = Rand.getRandBytes(32)
const seedZ = Rand.getRandBytes(32)

console.log(seedA, seedZ)

// Setup our (a/A) and (z/Z) keypairs.
const a = Field.fromPrivate(seedA)
const A = Point.from(a.point)
const z = Field.fromPrivate(seedZ)
const Z = Point.from(z.point)

const sharedA = A.mul(z.num).x
const sharedZ = Z.mul(a.num).x

console.log(sharedA)
console.log(sharedZ)