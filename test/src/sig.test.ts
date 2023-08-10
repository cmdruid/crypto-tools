import { Test }  from 'tape'
import { Buff }  from '@cmdcode/buff-utils'
import * as tiny from 'tiny-secp256k1'

import { keys, sig, noble, util } from '../../src/index.js'

export default async function (t : Test) {
  t.test('Test signing/validation of signatures.', async t => {
    const message = util.random(32)
    const sec_key = noble.schnorr.utils.randomPrivateKey()

    const tiny_pub  = Buff.raw(tiny.pointFromScalar(sec_key) as Uint8Array).slice(1)
    const noble_pub = Buff.raw(noble.schnorr.getPublicKey(sec_key))
    const utils_pub = keys.get_pubkey(sec_key, true)

    const tiny_sig  = Buff.raw(tiny.signSchnorr(message, sec_key))
    const noble_sig = noble.schnorr.sign(message, sec_key)
    const utils_sig = sig.sign(message, sec_key, { throws : true })

    const tiny_check    = noble.schnorr.verify(tiny_sig, message, tiny_pub)
    const noble_check   = tiny.verifySchnorr(message, noble_pub, noble_sig)
    const tiny_valid    = tiny.verifySchnorr(message, utils_pub, utils_sig)
    const noble_valid   = noble.schnorr.verify(utils_sig, message, utils_pub)
    const utils_valid_1 = sig.verify(tiny_sig, message, tiny_pub, { throws : true })
    const utils_valid_2 = sig.verify(noble_sig, message, noble_pub, { throws : true })
    const utils_valid_3 = sig.verify(utils_sig, message, utils_pub, { throws : true })

    t.plan(9)
    t.equal(utils_pub.hex, noble_pub.hex, 'Our pubkey should match tiny pubkey.')
    t.equal(utils_pub.hex, tiny_pub.hex,  'Our pubkey should match noble pubkey.')
    t.true(tiny_check,  'Noble verify should find tiny signature valid.')
    t.true(noble_check, 'Tiny verify should find noble signature valid.')
    t.true(tiny_valid,  'Tiny verify should find our signature valid.')
    t.true(noble_valid, 'Noble verify should find our signature valid.')
    t.true(utils_valid_1, 'Our verify should find tiny signature valid.')
    t.true(utils_valid_2, 'Our verify should find noble signature valid.')
    t.true(utils_valid_3, 'Our verify should find our signature valid.')
  })
}
