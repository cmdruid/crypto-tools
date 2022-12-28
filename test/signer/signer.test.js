import { Buff }   from '@cmdcode/buff-utils'
import * as Noble from '@noble/secp256k1'
import { Signer } from '../../src/signer.js'

const randomBytes = Buff.random(32).toBytes()
const randomData  = Buff.random(32).toBytes()

export default async function (t) {

  t.test('Test signing/validation of Signer suite.', async t => {

    const schnorrSigner = Signer.from(randomBytes)
    const ecdsaSigner   = Signer.from(randomBytes, 'ecdsa')

    const schnorrPub = schnorrSigner.publicKey
    const schnorrXonlyPub = schnorrSigner.xOnlyPub
    const NobleSchnorrPub = Noble.schnorr.getPublicKey(randomBytes)

    const ecdsaPub   = ecdsaSigner.publicKey
    const NobleEcdsaPub = Noble.getPublicKey(randomBytes, true)

    const schnorrSig = await schnorrSigner.sign(randomData)
    const ecdsaSig   = await ecdsaSigner.sign(randomData)

    const isValidA = await schnorrSigner.verify(randomData, schnorrSig)
    const isValidB = await ecdsaSigner.verify(randomData, ecdsaSig)
    const isValidC = await Signer.verify(randomData, schnorrPub, schnorrSig)
    const isValidD = await Signer.verify(randomData, ecdsaPub, ecdsaSig, 'ecdsa')

    t.plan(6)
    t.deepEqual(schnorrXonlyPub, NobleSchnorrPub, 'Schnorr pubkeys should match.')
    t.deepEqual(ecdsaPub, NobleEcdsaPub, 'ECDSA pubkeys should match.')
    t.equal(isValidA, true, 'Schnorr signature A should be valid.')
    t.equal(isValidB, true, 'ECDSA signature B should be valid.')
    t.equal(isValidC, true, 'Schnorr signature C should be valid.')
    t.equal(isValidD, true, 'ECDSA signature D should be valid.')
  })
}
