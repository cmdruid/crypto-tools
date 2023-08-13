import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'

import {
  keys,
  noble,
  signer,
  Field,
  Point
} from '../../src/index.js'

import vector_tests from './vectors/tweak.vectors.json' assert { type: 'json' }

const { sec_vectors } = vector_tests

export default function tweakTests(t : Test) {
  t.test('Testing Key tweaking', async t => {

    t.plan(sec_vectors.length * 6)

    for (const vector of sec_vectors) {
      const { internalPrivkey, internalPubkey, tweak, tweakedPrivkey } = vector

      const message = Buff.str('the chicken wings made my fingers turn purple.').digest
      const sec_key = Field.mod(internalPrivkey)

      t.equal(sec_key.hex, internalPrivkey, 'Internal secret keys should match.')

      const pub_key = Point.from_x(internalPubkey)
      t.equal(pub_key.x.hex, internalPubkey, 'Internal public keys should match.')

      const tweaked_sec = sec_key.negated.add(tweak)
      t.equal(tweaked_sec.hex, tweakedPrivkey, 'The tweaked private keys should match.')

      const tweaked_pub = pub_key.add(tweak).x.hex
      const target_pub  = keys.get_pubkey(tweakedPrivkey, true)
      t.equal(tweaked_pub, target_pub.hex, 'The tweaked public keys should match.')

      const utils_sig   = signer.sign(message, tweaked_sec)
      const noble_valid = noble.schnorr.verify(utils_sig, message, tweaked_pub)
      const utils_valid = signer.verify(utils_sig, message, tweaked_pub, { throws: true })

      if (!noble_valid) {
        console.log('utils sig:', utils_sig.hex)
      }

      t.true(noble_valid, 'The signature should validate with noble.')
      t.true(utils_valid, 'The signature should validate with our signer.')
    }

  })
}