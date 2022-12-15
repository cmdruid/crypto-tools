import { getRandBytes } from '../../../../../src/util.js'
import { importKey, generateKey } from '../../../../../src/keys.js'

export default async function (t, f) {
  const randomKey = await generateKey()
  const randomBytes = getRandBytes(32)
  const importedKey = importKey(randomBytes)
  const cipherWithKey = new f(randomKey)
  const cipherWithImport = new f(randomBytes)

  t.plan(2)
  t.deepEqual(randomKey, cipherWithKey.secret, 'Cipher secret should equal CryptoKey')
  t.deepEqual(await importedKey, await cipherWithImport.secret, 'Cipher secret should equal CryptoKey')
}
