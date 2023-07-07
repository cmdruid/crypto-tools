import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'
import { noble, sig, util } from '../../src/index.js'

export default async function (t : Test) {
  t.test('Test signing/validation of signatures.', async t => {
    const message = util.random(32)
    const sec_key = noble.schnorr.utils.randomPrivateKey() 

    const noble_pub = Buff.raw(noble.schnorr.getPublicKey(sec_key))
    const utils_pub = util.getPublicKey(sec_key, true)

    const noble_sig = noble.schnorr.sign(message, sec_key)
    const utils_sig = sig.sign(message, sec_key, { throws : true })

    const noble_valid   = noble.schnorr.verify(utils_sig, message, utils_pub)
    const utils_valid_1 = sig.verify(noble_sig, message, noble_pub, { throws : true })
    const utils_valid_2 = sig.verify(utils_sig, message, utils_pub, { throws : true })

    t.plan(4)
    t.equal(utils_pub.hex, noble_pub.hex, 'Both pubkeys should match.')
    t.true(noble_valid, 'Noble verify should find our signature valid.')
    t.true(utils_valid_1, 'Our verify should find noble signature valid.')
    t.true(utils_valid_2, 'Our verify should find our signature valid.')
  })
}
