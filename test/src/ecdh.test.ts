import test from 'tape'

import { keys, Field, util } from '../../src/index.js'

export default function () {
  test('Testing ECDH Shared Secret Derivation', async t => {
    const a_field = new Field(util.random(32))
    const a_point = a_field.point
    const b_field = new Field(util.random(32))
    const b_point = b_field.point

    const raw_ab = b_point.mul(a_field).x.hex
    const raw_ba = a_point.mul(b_field).x.hex

    const ecdsa_ab = keys.ecdh(a_field.hex, b_point.hex, false).hex
    const ecdsa_ba = keys.ecdh(b_field.hex, a_point.hex, false).hex

    const schnorr_ab = keys.ecdh(a_field.hex, b_point.x.hex, true).hex
    const schnorr_ba = keys.ecdh(b_field.hex, a_point.x.hex, true).hex

    const mixed_ab = keys.ecdh(a_field.hex, b_point.x.hex, true).hex
    const mixed_ba = keys.ecdh(b_field.hex, a_point.hex, false).slice(1).hex

    t.plan(4)

    t.equal(raw_ab, raw_ba,         'raw shared secrets should be equal.'     )
    t.equal(ecdsa_ab, ecdsa_ba,     'ecdsa shared secrets should be equal.'   )
    t.equal(schnorr_ab, schnorr_ba, 'schnorr shared secrets should be equal.' )
    t.equal(mixed_ab, mixed_ba,     'mixed shared secrets should be equal.'   )
  })
}