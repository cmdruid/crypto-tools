import { Buff } from '@cmdcode/buff-utils'
import * as ecc from 'tiny-secp256k1'

import { Field, Noble } from '../../src/index.js'

const ec = new TextEncoder()

const seed  = Buff.hex('80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF')

const kA = ecc.pointFromScalar(seed)
const kB = Noble.Point.BASE.multiply(BigInt('0x80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF80FFFFFF'))
const k1 = Field.fromPrivate(seed)
const K1 = k1.point

const K2 = ecc.pointFromScalar(seed, true)

if (K2 === null) {
  throw TypeError('Encountered null value!')
}

const msg = Buff.buff(ec.encode('test'), 32)

const sig1A = ecc.sign(msg, k1)
const sig1B = ecc.sign(msg, seed)

const tweak = Buff.num(150, 32)

const t1 = k1.add(tweak)
const t2 = ecc.privateAdd(seed, tweak)
const T1 = K1.add(tweak)
const T2 = ecc.pointAddScalar(K2, tweak, true)
const T3 = ecc.pointAddScalar(K1.rawX, tweak, true)

if (t2 === null || T2 === null || T3 === null) {
  throw TypeError('Encountered null value!')
}

const sig2A = ecc.sign(msg, t1)
const sig2B = ecc.sign(msg, t2)

export default function ECCTest(t) {
  t.test('Testing ECC Primitives', t => {
    t.plan(13)
    t.deepEqual(new Uint8Array(k1), new Uint8Array(seed), 'should be equal seed values')
    t.deepEqual(K1.rawX, K2, 'should be equal points')

    t.equal(ecc.verify(msg, K2, sig1A), true, 'sig1A and K2 should be valid')
    t.equal(ecc.verify(msg, K1.rawX, sig1B), true, 'sig1B and K1 should be valid')

    t.deepEqual(new Uint8Array(t1), new Uint8Array(t2), 'our tweaked scalar should match ecc scalar')

    t.deepEqual(T1.rawX, T2, 'our tweaked point should match ecc point')
    t.deepEqual(T2, T3, 'ecc points should match when tweaking point or scalar')

    t.equal(ecc.verify(msg, T1.rawX, sig2A), true, 'T1 should verify signature 2A')
    t.equal(ecc.verify(msg, T2, sig2A), true, 'T2 should verify signature 2A')
    t.equal(ecc.verify(msg, T3, sig2A), true, 'T3 should verify signature 2A')

    t.equal(ecc.verify(msg, T1.rawX, sig2B), true, 'T1 should verify signature 2B')
    t.equal(ecc.verify(msg, T2, sig2B), true, 'T2 should verify signature 2B')
    t.equal(ecc.verify(msg, T3, sig2B), true, 'T3 should verify signature 2B')
  })
}
