import { Test }      from 'tape'
import { Buff }      from '@cmdcode/buff-utils'
import { Field }     from '../../src/ecc.js'
import { SecretKey } from '../../src/keypair.js'
import { schnorr }   from '@noble/curves/secp256k1'
import vector_tests  from './tweak.vectors.json' assert { type: 'json' }

const { sec_vectors } = vector_tests

export default function tweakTests(t : Test) {
  t.test('Testing Key tweaking', async t => {

    t.plan(sec_vectors.length * 5)

    for (const vector of sec_vectors) {
      const { internalPrivkey, internalPubkey, tweak, tweakedPrivkey } = vector

      const msg = Buff.random().hex

      const seckey = new SecretKey(internalPrivkey, { type: 'schnorr', xonly: true })
      t.equal(seckey.hex, internalPrivkey, 'Internal secret keys should match.')

      // const field  = new Field(internalPrivkey)
      // console.log(seckey.hex)
      // console.log(field.hex)

      const pubkey = seckey.pub
      t.equal(pubkey.hex, internalPubkey, 'Internal public keys should match.')

      const tweaked_sec = seckey.add(tweak)
      t.equal(tweaked_sec.hex, tweakedPrivkey, 'The tweaked private keys should match.')

      // const tweaked_field = field.negated.add(tweak)
      // console.log(tweaked_sec.hex)
      // console.log(tweaked_field.hex)
      // console.log(tweakedPrivkey)

      // console.log('pub:', pubkey.hex)

      const tweakedPub = pubkey.add(tweak)
      const targetPub  = new Field(tweakedPrivkey).negated.point.x

      const seckey_sig = tweaked_sec.sign(msg)
      const noble_sig  = schnorr.sign(msg, tweakedPrivkey)

      const pubkey_valid = tweakedPub.verify(noble_sig, msg)
      const noble_valid  = schnorr.verify(seckey_sig.hex, msg, targetPub.hex)

      t.equal(pubkey_valid, true, 'The seckey signature should validate.')
      t.equal(noble_valid, true, 'The noble signature should validate.')
    }

  })

  // t.test('Testing Pubkey tweaking')
}