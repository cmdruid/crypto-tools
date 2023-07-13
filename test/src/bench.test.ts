import { Test }      from 'tape'
import { ecc, util } from '../../src/index.js'

export default async function (t : Test) {
  t.test('Bench test of signature validation.', async t => {

    const rounds  = 10000
    const results : [ number, boolean, string ][] = []

    for (let i = 0; i < rounds; i++) {
      const message = util.random(32)
      const sec_key = util.random(32)

      const utils_pub = ecc.get_pubkey(sec_key, true)
      const utils_sig = ecc.sign(message, sec_key)
      const is_valid  = ecc.verify(utils_sig, message, utils_pub, { throws : false })

      results.push([ i, is_valid, 'Our signature should be valid.' ])
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
