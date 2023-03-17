
import { Buff } from '@cmdcode/buff-utils'
import * as ECC from '../../src/ecc.js'
import { Hash } from '../../src/hash.js'

const { Field, Point } = ECC
const ec = new TextEncoder()

export default function schnorrTest(t) {
  t.test('Testing ECC Schnorr Signatures', async t => {

    // Define seed values for keys (a) and (k).
    const seedA = Buff.random(32)
    const seedK = seedA.reverse()

    // Define a dummy message.
    const m = new Uint8Array(32)
    m.set(ec.encode('test message'))

    // Setup our (a/A) and (k/R) keypairs.
    const a = new Field(seedA)
    const A = Point.import(a.point)
    const k = new Field(seedK)
    const R = Point.import(k.point)

    // Create our hashed message digest comitting to R.
    const hmR = await Hash.sha256(Uint8Array.of(...m, ...R.rawX))

    // Should derive the same "signature" by 
    // using identical tweaks between keypairs.
    const sig = k.sub(a.mul(hmR)).point.x
    const siG = R.sub(A.mul(hmR)).x

    t.plan(1)
    t.equal(sig, siG, 'signature derivations should be equal.')
  })
}