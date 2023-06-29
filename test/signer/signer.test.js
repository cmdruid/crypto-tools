import { Buff }   from '@cmdcode/buff-utils'
import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'
import { KeyPair } from '../../src/keypair.js'
import { verify }  from '../../src/secp.js'

const randomBytes = Buff.random(32)
const randomData  = Buff.random(32)

export default async function (t) {

  t.test('Test signing/validation of KeyPair suite.', async t => {

    const schnr_sec = new KeyPair(randomBytes, { type: 'schnorr', xonly: true })
    const ecdsa_sec = new KeyPair(randomBytes, { type: 'ecdsa' })

    const schnr_pub       = schnr_sec.pub.hex
    const noble_schnr_pub = Buff.raw(schnorr.getPublicKey(randomBytes)).hex

    const ecdsa_pub       = ecdsa_sec.pub.hex
    const noble_ecdsa_pub = Buff.raw(secp.getPublicKey(randomBytes, true)).hex

    const schnr_sig = schnr_sec.sign(randomData)
    const ecdsa_sig = ecdsa_sec.sign(randomData)

    const int_schnr_verify = schnr_sec.verify(schnr_sig, randomData)
    const int_ecdsa_verify = ecdsa_sec.verify(ecdsa_sig, randomData)
    const ext_schnr_verify = verify(schnr_sig, randomData, schnr_pub, { type: 'schnorr', xonly: true })
    const ext_ecdsa_verify = verify(ecdsa_sig, randomData, ecdsa_pub, { type: 'ecdsa' })
    const nbl_schnr_verify = schnorr.verify(schnr_sig, randomData, schnr_pub)
    const nbl_ecdsa_verify = secp.verify(ecdsa_sig, randomData, ecdsa_pub)

    t.plan(8)
    t.equal(schnr_pub, noble_schnr_pub, 'Schnorr pubkeys should match.')
    t.equal(ecdsa_pub, noble_ecdsa_pub, 'ECDSA pubkeys should match.')
    t.equal(int_schnr_verify, true, 'INT Schnorr signature should be valid.')
    t.equal(int_ecdsa_verify, true, 'INT ECDSA signature should be valid.')
    t.equal(ext_schnr_verify, true, 'EXT Schnorr signature should be valid.')
    t.equal(ext_ecdsa_verify, true, 'EXT ECDSA signature should be valid.')
    t.equal(nbl_schnr_verify, true, 'NBL Schnorr signature should be valid.')
    t.equal(nbl_ecdsa_verify, true, 'NBL ECDSA signature should be valid.')
  })
}
