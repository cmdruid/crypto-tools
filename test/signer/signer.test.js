import Signer from '../../src/signer.js'
import { getRandBytes } from '../../src/util.js'

const randomBytes = getRandBytes(32)
const randomData  = getRandBytes(32)

export default async function (t) {

  t.test('Test signing/validation of Signer suite.', async t => {

    const schnorrSigner = Signer.from(randomBytes)
    const ecdsaSigner   = Signer.from(randomBytes, 'ecdsa')

    const schnorrPub = schnorrSigner.publicKey
    const ecdsaPub = ecdsaSigner.publicKey

    const schnorrSig = await schnorrSigner.sign(randomData)
    const ecdsaSig   = await ecdsaSigner.sign(randomData)

    const isValidA = await schnorrSigner.verify(randomData, schnorrSig)
    const isValidB = await ecdsaSigner.verify(randomData, ecdsaSig)
    const isValidC = await Signer.verify(randomData, schnorrPub, schnorrSig)
    const isValidD = await Signer.verify(randomData, ecdsaPub, ecdsaSig, 'ecdsa')

    t.plan(4)
    t.equal(isValidA, true, 'Schnorr signature A should be valid.')
    t.equal(isValidB, true, 'ECDSA signature B should be valid.')
    t.equal(isValidC, true, 'Schnorr signature C should be valid.')
    t.equal(isValidD, true, 'ECDSA signature D should be valid.')
  })
}
