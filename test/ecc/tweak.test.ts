import { Test }     from 'tape'
import { SecretKey }   from '../../src/keypair.js'
import vector_tests from './tweak.vectors.json' assert { type: 'json' }

const { sec_vectors } = vector_tests

export default function tweakTests(t : Test) {
  t.test('Testing Key tweaking', async t => {

    t.plan(sec_vectors.length * 3)

    for (const vector of sec_vectors) {
      const { internalPrivkey, internalPubkey, tweak, tweakedPrivkey } = vector

      const seckey = new SecretKey(internalPrivkey, true)

      const pubkey = seckey.pub

      t.equal(pubkey.hexX, internalPubkey, 'Interal private key should generate matching pubkey.')

      let tweakedSec = seckey.add(tweak)

      t.equal(tweakedSec.hex, tweakedPrivkey, 'The tweaked private keys should match.')

      const tweakedPub = pubkey.add(tweak).hex

      t.equal(tweakedPub, tweakedSec.point.hex, 'The tweaked public keys should be equal.')
    }

  })

  // t.test('Testing Pubkey tweaking')
}