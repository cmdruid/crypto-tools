import { Buff }   from '@cmdcode/buff-utils'
import * as Noble from '@cmdcode/secp256k1'
import { KeyPair } from '../../src/keypair.js'
import { verify }  from '../../src/signer.js'

const randomBytes = Buff.random(32)
const randomData  = Buff.random(32)

export default async function (t) {

  t.test('Test signing/validation of KeyPair suite.', async t => {

    const schnr_sec = new KeyPair(randomBytes)
    const ecdsa_sec = new KeyPair(randomBytes)

    const schnr_pub       = schnr_sec.pub.hexX
    const noble_schnr_pub = Buff.raw(Noble.schnorr.getPublicKey(randomBytes)).hex

    const ecdsa_pub       = ecdsa_sec.pub.hex
    const noble_ecdsa_pub = Buff.raw(Noble.getPublicKey(randomBytes, true)).hex

    const schnr_sig = await schnr_sec.sign(randomData, 'schnorr')
    const ecdsa_sig = await ecdsa_sec.sign(randomData, 'ecdsa')

    const int_schnr_verify = await schnr_sec.verify(schnr_sig, randomData, 'schnorr')
    const int_ecdsa_verify = await ecdsa_sec.verify(ecdsa_sig, randomData, 'ecdsa')
    const ext_schnr_verify = await verify(schnr_sig, randomData, schnr_pub, 'schnorr')
    const ext_ecdsa_verify = await verify(ecdsa_sig, randomData, ecdsa_pub, 'ecdsa')
    const nbl_schnr_verify = await Noble.schnorr.verify(schnr_sig, randomData, schnr_pub)
    const nbl_ecdsa_verify = Noble.verify(ecdsa_sig, randomData, ecdsa_pub)

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
