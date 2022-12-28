import { Buff } from '@cmdcode/buff-utils'
import { KeyImport } from '../../../../../src/keys.js'

// export default async function (t, f) {
//   const randomKey = await KeyImport.generate()
//   const randomBytes = await KeyImport.crypto(Buff.random(32))
//   const importedKey = await KeyImport.crypto(randomBytes)
//   const cipherWithKey = new f(randomKey)
//   const cipherWithImport = new f(randomBytes)

//   t.plan(1)
//   t.deepEqual(randomKey, cipherWithKey.secret, 'Cipher secret should equal CryptoKey')
//   t.deepEqual(importedKey, await cipherWithImport.key, 'Cipher secret should equal CryptoKey')
// }
