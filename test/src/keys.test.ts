import test from 'tape'
import { Buff, Bytes } from '@cmdcode/buff'

import * as tiny from 'tiny-secp256k1'
import * as ecc  from '../../src/index.js'

export default function () {
  test('Testing sequential key tweaks', async t => {
    const seed    = ecc.util.random()
    const tweaks  = generate_tweaks(10)
    const [ seckey, pubkey ] = ecc.keys.get_keypair(seed, true, true)

    const int_twk_sec = ecc.keys.tweak_seckey(seckey, tweaks, true)
    const int_twk_pub = ecc.keys.tweak_pubkey(pubkey, tweaks, true)
    const int_com_pub = ecc.keys.get_pubkey(int_twk_sec, true)

    const tiny_twk_sec = apply_sec_tweaks(seckey, tweaks)
    const tiny_twk_pub = apply_pub_tweaks(pubkey, tweaks)

    t.equal(int_twk_sec.hex, tiny_twk_sec.hex, 'The tweaked seckeys should match.')
    t.equal(int_twk_pub.hex, tiny_twk_pub.hex, 'The tweaked pubkeys should match.')
    t.equal(int_com_pub.hex, tiny_twk_pub.hex, 'The computed pubkey should match.')
  })
}

function apply_sec_tweaks (
  seckey : Bytes,
  tweaks : Bytes[]
) {
  let sec = Buff.bytes(seckey).raw
  for (const tweak of tweaks) {
    const twk = Buff.bytes(tweak).raw
    const ret = tiny.privateAdd(sec, twk)
    if (ret === null) throw new Error('tweak returned null value!')
    const pub = tiny.pointFromScalar(ret, true)
    if (pub === null) throw new Error('tweak returned null point!')
    sec = (pub[0] === 3) ? tiny.privateNegate(ret) : ret
  }
  return Buff.raw(sec)
}

function apply_pub_tweaks (
  pubkey : Bytes,
  tweaks : Bytes[]
) {
  let pub = Buff.bytes(pubkey).raw
  for (const tweak of tweaks) {
    const twk = Buff.bytes(tweak).raw
    const ret = tiny.xOnlyPointAddTweak(pub, twk)
    if (ret === null) throw new Error('tweak returned null point!')
    pub = ret.xOnlyPubkey
  }
  return Buff.raw(pub)
}

function generate_tweaks (count = 3) {
  const tweaks : Buff[] = []
  for (let i = 0; i < count; i++) {
    tweaks.push(ecc.util.random(32))
  }
  return tweaks
}
