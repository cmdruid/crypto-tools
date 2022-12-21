import { getRandBytes } from '../../../../../src/util.js'
import { importCryptoKey } from '../../../../../src/keys.js'

export default async function (t, f) {
  const randomBytes = getRandBytes(32)
  const importedKey = importCryptoKey(randomBytes)
  const cipherWithImport = f(randomBytes)

  t.plan(1)
  t.deepEqual(await importedKey, await cipherWithImport.secret, 'Cipher secret should equal CryptoKey')
}
