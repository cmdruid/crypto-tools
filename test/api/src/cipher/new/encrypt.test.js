import { getRandBytes } from '../../../../../src/util.js'

export default async function (t, f) {
  const randomBytes = getRandBytes(32)
  const randomData = getRandBytes(32)

  const cipher = new f(randomBytes)

  const encrypted = await cipher.encrypt(randomData)

  const decrypted = await cipher.decrypt(encrypted)

  t.plan(1)
  t.deepEqual(randomData, decrypted, 'Test data should match decrypted data')
}
