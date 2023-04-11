import { Buff, Hash } from '@cmdcode/buff-utils'
import * as ECC  from '../../src/ecc.js'

const { Field, Point } = ECC
const ec = new TextEncoder()

export default async function dlcTest(t) {
  t.test('Testing ECC Discrete Log Signatures', async t => {

    // Define some dummy message.
    const m1 = new Uint8Array(32)
    const m2 = new Uint8Array(32)
    m1.set(ec.encode('cloudy day'))
    m2.set(ec.encode('bitcoin transaction'))

    // Setup our (a/A), (k/R), and (sk/sR) keypairs.
    const a  = new Field(Buff.random(32))
    const A  = Point.import(a.point)
    const k  = new Field(Buff.random(32))
    const R  = Point.import(k.point)
    const sk = new Field(Buff.random(32))
    const sR = Point.import(sk.point)

    // Create our hashed message digest comitting to R.
    const hmR = await Hash.sha256(Uint8Array.of(...m1, ...R.x))
    const hsR = await Hash.sha256(Uint8Array.of(...m2, ...sR.x))

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
