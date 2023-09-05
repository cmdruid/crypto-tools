import test      from 'tape'
import { Buff }  from '@cmdcode/buff-utils'
import * as tiny from 'tiny-secp256k1'
import { keys, noble, signer, util } from '../../src/index.js'

export default async function () {
  test('Stress test of signature validation.', async t => {

    const rounds  = 100
    const results : [ number, boolean, string ][] = []

    for (let i = 0; i < rounds; i++) {
      const message = util.random(32)
      const sec_key = noble.schnorr.utils.randomPrivateKey()

      const tiny_pub  = Buff.raw(tiny.pointFromScalar(sec_key) as Uint8Array).slice(1)
      const noble_pub = Buff.raw(noble.schnorr.getPublicKey(sec_key))
      const utils_pub = keys.get_pubkey(sec_key, true)

      const tiny_sig  = Buff.raw(tiny.signSchnorr(message, sec_key))
      const noble_sig = Buff.raw(noble.schnorr.sign(message, sec_key))
      const utils_sig = signer.sign(message, sec_key)

      const tiny_check    = noble.schnorr.verify(tiny_sig, message, tiny_pub)
      const noble_check   = tiny.verifySchnorr(message, noble_pub, noble_sig)
      const tiny_valid    = tiny.verifySchnorr(message, utils_pub, utils_sig)
      const noble_valid   = noble.schnorr.verify(utils_sig, message, utils_pub)

      const utils_valid_1 = signer.verify(tiny_sig, message, tiny_pub,   { throws : false })
      const utils_valid_2 = signer.verify(noble_sig, message, noble_pub, { throws : false })
      const utils_valid_3 = signer.verify(utils_sig, message, utils_pub, { throws : false })

      results.push([ i, utils_pub.hex === tiny_pub.hex, 'Our pubkey should match tiny pubkey.' ])
      results.push([ i, utils_pub.hex === noble_pub.hex, 'Our pubkey should match noble pubkey.' ])
      results.push([ i, tiny_check,  'Noble verify should find tiny signature valid.' ])
      results.push([ i, noble_check, 'Tiny verify should find noble signature valid.' ])
      results.push([ i, tiny_valid,  'Tiny verify should find our signature valid.' ])
      results.push([ i, noble_valid, 'Noble verify should find our signature valid.' ])
      results.push([ i, utils_valid_1, 'Our verify should find tiny signature valid.' ])
      results.push([ i, utils_valid_2, 'Our verify should find noble signature valid.' ])
      results.push([ i, utils_valid_3, 'Our verify should find our signature valid.' ])
    }

    const failed = results.filter(e => e[1] === false)

    t.plan(1)

    if (failed.length === 0) {
      t.pass('All signature tests passed')
    } else {
      console.log('Failed tests:')
      console.log(failed)
      t.fail('Some signature tests have failed!')
    }
  })
}
