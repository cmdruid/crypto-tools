import { Buff } from '@cmdcode/buff-utils'

export default async function (t, f) {
  const randomBytes = Buff.random(32).toBytes()
  const randomData  = Buff.random(32).toBytes()

  const cipher = new f(randomBytes)

  const encrypted = await cipher.encrypt(randomData)

  const decrypted = await cipher.decrypt(encrypted)

  t.plan(1)
  t.deepEqual(randomData, decrypted, 'Test data should match decrypted data')
}
