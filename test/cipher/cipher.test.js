import Cipher from '../../src/cipher.js'
import { getRandBytes } from '../../src/util.js'
import { genKeyPair } from '../../src/keys.js'

export default async function (t) {

  t.test('Test encryption/decryption of Cipher suite.', async t => {
    const randomBytes = getRandBytes(32)
    const randomData  = getRandBytes(32)
    const { publicKey } = genKeyPair()
    const cipher = Cipher.from(randomBytes)

    const encrypted = await cipher.encrypt(randomData)
    const decrypted = await cipher.decrypt(encrypted)

    const encryptedShared = await cipher.encryptShared(publicKey, randomData)
    const decryptedShared = await cipher.decryptShared(publicKey, encryptedShared)

    t.plan(2)
    t.deepEqual(randomData, decrypted, 'Decrypted data should equal test data.')
    t.deepEqual(randomData, decryptedShared, 'Decrypted data should equal test data.')
  })
}
