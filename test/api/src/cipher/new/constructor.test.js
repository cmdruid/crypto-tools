import { Buff } from '@cmdcode/buff-utils'
import { importCryptoKey, genCryptoKey } from '../../../../../src/keys.js'

export default async function (t, f) {
  const randomKey = await genCryptoKey()
  const randomBytes = Buff.random(32)
  const importedKey = importCryptoKey(randomBytes)
  const cipherWithKey = new f(randomKey)
  const cipherWithImport = new f(randomBytes)

  t.plan(2)
  t.deepEqual(randomKey, cipherWithKey.secret, 'Cipher secret should equal CryptoKey')
  t.deepEqual(await importedKey, await cipherWithImport.secret, 'Cipher secret should equal CryptoKey')
}
