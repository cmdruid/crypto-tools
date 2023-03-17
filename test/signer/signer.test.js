import { Buff }   from '@cmdcode/buff-utils'
import * as Noble from '@cmdcode/secp256k1'
import { KeyPair } from '../../src/keypair.js'
import { verify }  from '../../src/signer.js'

const randomBytes = Buff.random(32).toBytes()
const randomData  = Buff.random(32).toBytes()

export default async function (t) {

  t.test('Test signing/validation of KeyPair suite.', async t => {

    const schnorrKeyPair = new KeyPair(randomBytes)
    const ecdsaKeyPair   = new KeyPair(randomBytes)

    const schnorrPub = schnorrKeyPair.pub.rawX
    const NobleSchnorrPub = Noble.schnorr.getPublicKey(randomBytes)

    const ecdsaPub   = ecdsaKeyPair.pub.raw
    const NobleEcdsaPub = Noble.getPublicKey(randomBytes, true)

    const schnorrSig = await schnorrKeyPair.sign(randomData)
    const ecdsaSig   = await ecdsaKeyPair.sign(randomData, 'ecdsa')

    const isValidA = await schnorrKeyPair.verify(randomData, schnorrSig)
    const isValidB = await ecdsaKeyPair.verify(randomData, ecdsaSig, 'ecdsa')
    const isValidC = await verify(randomData, schnorrPub, schnorrSig)
    const isValidD = await verify(randomData, ecdsaPub, ecdsaSig, 'ecdsa')

    t.plan(6)
    t.deepEqual(schnorrPub, NobleSchnorrPub, 'Schnorr pubkeys should match.')
    t.deepEqual(ecdsaPub, NobleEcdsaPub, 'ECDSA pubkeys should match.')
    t.equal(isValidA, true, 'Schnorr signature A should be valid.')
    t.equal(isValidB, true, 'ECDSA signature B should be valid.')
    t.equal(isValidC, true, 'Schnorr signature C should be valid.')
    t.equal(isValidD, true, 'ECDSA signature D should be valid.')
  })
}
