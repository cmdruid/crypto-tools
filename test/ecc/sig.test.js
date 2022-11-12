import { Buff }  from '@cmdcode/bytes-utils'
import * as ECC  from '../../src/ecc.js'
import * as Hash from '../../src/hash.js'

const { Field, Point } = ECC
const ec = new TextEncoder()

export default function schnorrTest(t) {
  t.test('Testing ECC Schnorr Signatures', async t => {

    // Define seed values for keys (a) and (k).
    const seedA = Buff.hex('3ddd5602285899a946114506157c7997e5444528f3003f6134712147db19b678').toBytes()
    const seedK = seedA.reverse()

    // Define a dummy message.
    const m = new Uint8Array(32)
    m.set(ec.encode('test message'))

    // Setup our (a/A) and (k/R) keypairs.
    const a = Field.fromPrivate(seedA)
    const A = Point.from(a.point)
    const k = Field.fromPrivate(seedK)
    const R = Point.from(k.point)

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