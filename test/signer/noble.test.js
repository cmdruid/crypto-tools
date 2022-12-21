import { Noble } from '../../src/index.js'
import { getRandBytes } from '../../src/util.js'

const randomBytes = getRandBytes(32)
const randomData  = getRandBytes(32)

export default async function (t) {
  t.test('Test signing/validation of Noble library.', async t => {

    const isValidPrivateKey = Noble.utils.isValidPrivateKey(randomBytes)
    const pubKeyA = Noble.schnorr.getPublicKey(randomBytes)
    const pubKeyB = Noble.getPublicKey(randomBytes, true)

    const signature = await Noble.schnorr.sign(randomData, randomBytes)
    const sigECDSA  = await Noble.sign(randomData, randomBytes)
    const isValid   = await Noble.schnorr.verify(signature, randomData, pubKeyA)
    const isValidECDSA = Noble.verify(sigECDSA, randomData, pubKeyB)

    t.plan(3)
    t.equal(isValidPrivateKey, true, 'Private key should be valid.')
    t.equal(isValid, true, 'Schnorr signature should be valid.')
    t.equal(isValidECDSA, true, 'ECDSA signature should be valid.')
  })
}
