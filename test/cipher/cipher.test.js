import { Buff } from '@cmdcode/buff-utils'
import { Cipher }  from '../../src/cipher.js'
import { KeyPair } from '../../src/ecc.js'

export default async function (t) {

  t.test('Test encryption/decryption of Cipher suite.', async t => {

    t.plan(3)
    
    const alice = KeyPair.generate()
    const bob   = KeyPair.generate()
    const randomData = Buff.random(32).toBytes()

    const sharedCipherA = await Cipher.fromShared(alice.privateKey, bob.publicKey)
    const sharedCipherB = await Cipher.fromShared(bob.privateKey, alice.publicKey)

    t.equal(
      await sharedCipherA.secretHex, 
      await sharedCipherB.secretHex,
      'Both secrets should be equal.'
    )

    const encryptedA = await sharedCipherA.encrypt(randomData)
    const encryptedB = await sharedCipherB.encrypt(randomData)

    t.notEqual(
      Buff.buff(encryptedA.slice(0,16)).toHex(),
      Buff.buff(encryptedB.slice(0,16)).toHex(),
      'Both IVs should be different.'
    )

    const decryptedA = await sharedCipherA.decrypt(encryptedB)
    const decryptedB = await sharedCipherB.decrypt(encryptedA)

    t.equal(
      Buff.buff(decryptedA).toHex(),
      Buff.buff(decryptedB).toHex(),
      'Both decrypted payloads should be equal.'
    )
  })
}
