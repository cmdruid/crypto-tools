import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'
import { Field, Point, sha256, util } from '../../src/index.js'

const ec = new TextEncoder()

export default async function dlcTest(t : Test) {
  t.test('Testing ECC Discrete Log Signatures', async t => {

    // Define some dummy message.
    const m1 = Buff.str('cloudy day')
    const m2 = Buff.str('bitcoin sighash')

    // Setup our (a/A), (k/R), and (sk/sR) keypairs.
    const a  = Field.mod(util.random(32))
    const A  = Point.import(a.point)
    const k  = Field.mod(util.random(32))
    const R  = Point.import(k.point)
    const sk = Field.mod(util.random(32))
    const sR = Point.import(sk.point)

    // Create our hashed message digest comitting to R.
    const hmR = sha256(Buff.join([ m1, R.x ]))
    const hsR = sha256(Buff.join([ m2, sR.x ]))

    // This signature proof can be used as a public key.
    const siG = R.sub(A.mul(hmR))

    // The signature can be used as a private key.
    const sig = k.sub(a.mul(hmR))

    // Use the signature to sign another message.
    const dlc = sk.sub(sig.mul(hsR))

    // Verify the message using the signature proof.
    const DLC = sR.sub(siG.mul(hsR))

    t.plan(2)
    t.equal(sig.point.x.hex, siG.x.hex, 'signature proofs should be equal.')
    t.equal(dlc.point.x.hex, DLC.x.hex, 'dlc proofs should be equal.')
  })
}
