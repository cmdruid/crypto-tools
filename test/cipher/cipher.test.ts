import { Buff }    from '@cmdcode/buff-utils'
import { Test }    from 'tape'
import { Cipher }  from '../../src/cipher.js'
import { KeyPair } from '../../src/keypair.js'

export default async function (t : Test) {

  t.test('Test encryption/decryption of Cipher suite.', async t => {

    t.plan(3)
    
    const alice = KeyPair.random()
    const bob   = KeyPair.random()
    const randomData = Buff.random(32).toBytes()

    const sharedCipherA = await Cipher.fromShared(alice, bob.pub.raw)
    const sharedCipherB = await Cipher.fromShared(bob, alice.pub.raw)

    t.equal(
      await sharedCipherA.secretHex, 
      await sharedCipherB.secretHex,
      'Both secrets should be equal.'
    )

    const encryptedA = await sharedCipherA.encrypt(randomData)
    const encryptedB = await sharedCipherB.encrypt(randomData)

    t.notEqual(
      Buff.raw(encryptedA.slice(0,16)).hex,
      Buff.raw(encryptedB.slice(0,16)).hex,
      'Both IVs should be different.'
    )

    const decryptedA = await sharedCipherA.decrypt(encryptedB)
    const decryptedB = await sharedCipherB.decrypt(encryptedA)

    t.equal(
      Buff.raw(decryptedA).hex,
      Buff.raw(decryptedB).hex,
      'Both decrypted payloads should be equal.'
    )
  })
}
