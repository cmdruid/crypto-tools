import { Buff, Bytes }   from '@cmdcode/buff'
import { secp256k1 }     from '@noble/curves/secp256k1'
import { ProjPointType } from '@noble/curves/abstract/weierstrass'
import { _N, _P, _G }    from '../const.js'

import * as math         from './math.js'
import * as assert       from '../assert.js'

type ECPoint    = ProjPointType<bigint>
type FieldValue = string | number | bigint | Uint8Array | Field
type PointValue = string | number | bigint | Uint8Array | Point

const NoblePoint = secp256k1.ProjectivePoint

export class Field extends Uint8Array {
  static N = _N

  static add (x : FieldValue[]) : Field {
    return x.map(e => Field.mod(e)).reduce((p, n) => p.add(n))
  }

  static mod (x : FieldValue) : Field {
    return new Field(x)
  }

  static mul (x : FieldValue[]) : Field {
    return x.map(e => Field.mod(e)).reduce((p, n) => p.mul(n))
  }

  static is_valid (value : Bytes, throws ?: boolean) : boolean {
    const big = Buff.bytes(value, 32).big
    return assert.in_field(big, throws)
  }

  static random () {
    return Field.mod(Buff.random(32))
  }

  constructor (x : FieldValue) {
    const b = math.mod_n(normalizeField(x))
    Field.is_valid(b, true)
    super(Buff.big(b, 32), 32)
  }

  get buff () : Buff {
    return new Buff(this)
  }

  get raw () : Uint8Array {
    return this.buff.raw
  }

  get big () : bigint {
    return this.buff.big
  }

  get hex () : string {
    return this.buff.hex
  }

  get point () : Point {
    return this.generate()
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  get negated () : Field {
    return (this.hasOddY)
      ? this.negate()
      : this
  }

  gt (value : FieldValue) : boolean {
    const x = new Field(value)
    return x.big > this.big
  }

  lt (value : FieldValue) : boolean {
    const x = new Field(value)
    return x.big < this.big
  }

  eq (value : FieldValue) : boolean {
    const x = new Field(value)
    return x.big === this.big
  }

  ne (value : FieldValue) : boolean {
    const x = new Field(value)
    return x.big !== this.big
  }

  add (value : FieldValue) : Field {
    const x = Field.mod(value)
    const a = math.fd.add(this.big, x.big)
    return new Field(a)
  }

  sub (value : FieldValue) : Field {
    const x = Field.mod(value)
    const a = math.fd.sub(this.big, x.big)
    return new Field(a)
  }

  mul (value : FieldValue) : Field {
    const x = Field.mod(value)
    const a = math.fd.mul(this.big, x.big)
    return new Field(a)
  }

  pow (value : FieldValue) : Field {
    const x = Field.mod(value)
    const a = math.fd.pow(this.big, x.big)
    return new Field(a)
  }

  div (value : FieldValue) : Field {
    const x = Field.mod(value)
    const a = math.fd.div(this.big, x.big)
    return new Field(a)
  }

  negate () : Field {
    // const n = math.ecc.neg(this.big)
    return new Field(Field.N - this.big)
  }

  generate () : Point {
    const base  = secp256k1.ProjectivePoint.BASE
    const point = base.multiply(this.big)
    return Point.import(point)
  }
}

export class Point {
  static P     = _P
  static G     = new Point(_G.x, _G.y)
  static curve = secp256k1.CURVE
  static base  = secp256k1.ProjectivePoint.BASE

  static from_x (
    bytes : Bytes,
    even_y = false
  ) : Point {
    let cp = normalizePoint(bytes)
    if (cp.length === 32) {
      cp = cp.prepend(0x02)
    } else if (even_y) {
      cp[0] = 0x02
    }
    assert.size(cp, 33)
    const point = NoblePoint.fromHex(cp.hex)
    point.assertValidity()
    // assert.on_curve(point.x, true)
    return new Point(point.x, point.y)
  }

  static generate (value : FieldValue) : Point {
    const field = Field.mod(value)
    const point = Point.base.multiply(field.big)
    return Point.import(point)
  }

  static mul = Point.generate

  static import (point : Point | ECPoint) : Point {
    // console.log(point)
    const p = (point instanceof Point)
      ? { x: point.x.big, y: point.y.big }
      : { x: point.x, y: point.y }
    return new Point(p.x, p.y)
  }

  readonly _p : ECPoint

  constructor (
    x : bigint,
    y : bigint
  ) {
    this._p = new NoblePoint(x, y, 1n)
    this.p.assertValidity()
  }

  get p () : ECPoint {
    return this._p
  }

  get x () : Buff {
    return Buff.big(this.p.x, 32)
  }

  get y () : Buff {
    return Buff.big(this.p.y, 32)
  }

  get buff () : Buff {
    return Buff.raw(this.p.toRawBytes(true))
  }

  get raw () : Uint8Array {
    return this.buff.raw
  }

  get hex () : string {
    return this.buff.hex
  }

  get hasEvenY () : boolean {
    return this.p.hasEvenY()
  }

  get hasOddY () : boolean {
    return !this.p.hasEvenY()
  }

  get negated () : Point {
    return (this.hasOddY)
      ? this.negate()
      : this
  }

  eq (value : PointValue) : boolean {
    const p = (value instanceof Point) ? value : Point.from_x(value)
    return this.x.big === p.x.big && this.y.big === p.y.big
  }

  add (x : PointValue) : Point {
    return (x instanceof Point)
      ? Point.import(this.p.add(x.p))
      : Point.import(this.p.add(Point.generate(x).p))
  }

  sub (x : PointValue) : Point {
    return (x instanceof Point)
      ? Point.import(this.p.subtract(x.p))
      : Point.import(this.p.subtract(Point.generate(x).p))
  }

  mul (value : PointValue) : Point {
    return (value instanceof Point)
      ? Point.import(this.p.multiply(value.x.big))
      : Point.import(this.p.multiply(Field.mod(value).big))
  }

  negate () : Point {
    return Point.import(this.p.negate())
  }
}

function normalizeField (value : FieldValue | PointValue) : bigint {
  if (value instanceof Field) {
    return value.big
  }
  if (value instanceof Point) {
    return value.x.big
  }
  if (value instanceof Uint8Array) {
    return Buff.raw(value).big
  }
  if (typeof value === 'string') {
    return Buff.hex(value).big
  }
  if (typeof value === 'number') {
    return Buff.num(value).big
  }
  if (typeof value === 'bigint') {
    return BigInt(value)
  }
  throw TypeError('Invalid input type:' + typeof value)
}

function normalizePoint (value : FieldValue | PointValue) : Buff {
  if (value instanceof Field) {
    return value.point.buff
  }
  if (value instanceof Point) {
    return value.buff
  }
  if (
    value instanceof Uint8Array ||
    typeof value === 'string'
  ) {
    return Buff.bytes(value)
  }
  if (
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return Buff.bytes(value, 32)
  }
  throw new TypeError(`Unknown type: ${typeof value}`)
}
