import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'
import * as ecc from 'tiny-secp256k1'

import {
  Field,
  math,
  util
} from '../../src/index.js'

const a = util.random(32)
const b = util.random(32)

const fa = new Field(a)
const fb = new Field(b)

const tiny_add     = Buff.raw(ecc.privateAdd(a.raw, b.raw) as Uint8Array)
const noble_add    = Buff.big(math.ecc.add(a.big, b.big))
const field_add    = fa.add(fb)

const tiny_sub     = Buff.raw(ecc.privateSub(a.raw, b.raw) as Uint8Array)
const noble_sub    = Buff.big(math.ecc.sub(a.big, b.big))
const field_sub    = fa.sub(fb)

const tiny_neg     = Buff.raw(ecc.privateNegate(a.raw) as Uint8Array)
const noble_neg    = Buff.big(math.ecc.neg(a.big))
const field_neg    = fa.negate()

const noble_mul    = Buff.big(math.ecc.mul(a.big, b.big))
const field_mul    = fa.mul(fb)

const noble_div    = Buff.big(math.ecc.div(a.big, b.big))
const field_div    = fa.div(fb)

const tiny_pt_a    = ecc.pointFromScalar(a.raw) as Uint8Array
const noble_pt_a   = math.point.P.BASE.multiply(a.big)
const field_pt_a   = fa.point

const tiny_pt_b    = ecc.pointFromScalar(b.raw) as Uint8Array
const noble_pt_b   = math.point.P.BASE.multiply(b.big)
const field_pt_b   = fb.point

const tiny_pt_add  = ecc.pointAdd(tiny_pt_a, tiny_pt_b) as Uint8Array
const noble_pt_add = noble_pt_a.add(noble_pt_b)
const field_pt_add = field_pt_a.add(field_pt_b)

const noble_pt_sub = noble_pt_a.subtract(noble_pt_b)
const field_pt_sub = field_pt_a.sub(field_pt_b)

const tiny_pt_mul  = ecc.pointMultiply(tiny_pt_a, b.raw) as Uint8Array
const noble_pt_mul = noble_pt_a.multiply(b.big)
const field_pt_mul = field_pt_a.mul(b)

export default function ECCTest(t : Test) {
  t.test('Testing ECC Primitives', t => {
    t.plan(15)
    // Field Addition
    t.equal(field_add.hex, tiny_add.hex,  'addition should equal tiny scalar.')
    t.equal(field_add.hex, noble_add.hex, 'addition should equal noble scalar.')
    // Field Subtraction
    t.equal(field_sub.hex, tiny_sub.hex,  'subtraction should equal tiny scalar.')
    t.equal(field_sub.hex, noble_sub.hex, 'subtraction should equal noble scalar.')
    // Field Negation
    t.equal(field_neg.hex, tiny_neg.hex,  'negation should equal tiny scalar.')
    t.equal(field_neg.hex, noble_neg.hex, 'negation should equal noble scalar.')
    // Field Muliply / Divide
    t.equal(field_mul.hex, noble_mul.hex, 'multiply should equal noble scalar.')
    t.equal(field_div.hex, noble_div.hex, 'division should equal noble scalar.')
    // Point Generation
    t.equal(field_pt_a.hex, Buff.bytes(tiny_pt_a).hex, 'point should match tiny point.')
    t.equal(field_pt_a.hex, noble_pt_a.toHex(true),    'point should match noble point.')
    // Point Addition
    t.equal(field_pt_add.hex, Buff.bytes(tiny_pt_add).hex, 'addition should match tiny point.')
    t.equal(field_pt_add.hex, noble_pt_add.toHex(true),    'addition should match noble point.')
    // Point Subtraction
    t.equal(field_pt_sub.hex, noble_pt_sub.toHex(true),    'subtraction should match tiny point.')
    // Point / Scalar multiplication.
    t.equal(field_pt_mul.hex, Buff.bytes(tiny_pt_mul).hex, 'scalar multiply should match tiny point.')
    t.equal(field_pt_mul.hex, noble_pt_mul.toHex(true),    'scalar multiply should match noble point.')
  })
}
