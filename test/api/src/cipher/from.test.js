import { Buff } from '@cmdcode/buff-utils'
import { importCryptoKey } from '../../../../../src/keys.js'

export default async function (t, f) {
  const randomBytes = Buff.random(32)
  const importedKey = importCryptoKey(randomBytes)
  const cipherWithImport = f(randomBytes)

  t.plan(1)
  t.deepEqual(await importedKey, await cipherWithImport.secret, 'Cipher secret should equal CryptoKey')
}
