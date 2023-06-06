import { ProjPointType } from '@noble/curves/abstract/weierstrass'
import { secp256k1 as secp, schnorr } from '@noble/curves/secp256k1'
import { Buff } from '@cmdcode/buff-utils'

type ECPoint = ProjPointType<bigint>

const { ProjectivePoint: NoblePoint } = secp

type FieldValue = string | number | bigint | Uint8Array | Field
type PointValue = string | number | bigint | Uint8Array | Point

export class Field extends Uint8Array {
  static N = secp.CURVE.n

  static mod (x : bigint, n = Field.N) : bigint {
    return schnorr.utils.mod(x, n)
  }

  static pow (x : bigint, e : bigint, n = Field.N) : bigint {
    // Wrap starting values to field size.
    x = Field.mod(x, n)
    e = Field.mod(e, n)
    // If x value is zero, return zero.
    if (x === 0n) return 0n
    // Initialize result as 1.
    let res = 1n
    // While e value is greater than 0:
    while (e > 0n) {
      // If e value is odd, multiply x with result.
      if ((e & 1n) === 1n) {
        res = Field.mod(res * x, n)
      }
      // With e value being even, (e = e / 2).
      e = e >> 1n
      // Update x value.
      x = Field.mod(x * x, n)
    }
    return res
  }

  static normalize (num : FieldValue) : Uint8Array {
    num = normalizeField(num)
    num = Field.mod(num)
    Field.validate(num)
    return Buff.big(num, 32)
  }

  static validate (num : bigint) : boolean {
    return secp.utils.isValidPrivateKey(num)
  }

  constructor (x : FieldValue) {
    super(Field.normalize(x), 32)
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

  get xpoint () : Point {
    return new Point(this.point.x)
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  get negated () : Field {
    return (this.hasOddY)
      ? this.negate()
      : this
  }

  gt (big : FieldValue) : boolean {
    const x = new Field(big)
    return x.big > this.big
  }

  lt (big : FieldValue) : boolean {
    const x = new Field(big)
    return x.big < this.big
  }

  eq (big : FieldValue) : boolean {
    const x = new Field(big)
    return x.big === this.big
  }

  ne (big : FieldValue) : boolean {
    const x = new Field(big)
    return x.big !== this.big
  }

  add (big : FieldValue) : Field {
    const x = new Field(big)
    return new Field(this.big + x.big)
  }

  sub (big : FieldValue) : Field {
    const x = new Field(big)
    return new Field(this.big - x.big)
  }

  mul (big : FieldValue) : Field {
    const x = new Field(big)
    return new Field(this.big * x.big)
  }

  pow (big : FieldValue, n = Field.N - 1n) : Field {
    const x = new Field(big)
    const e = Field.mod(x.big, n)
    return new Field(this.big ** e)
  }

  div (big : FieldValue) : Field {
    const x = new Field(big)
    const d = this.pow(x.big, Field.N - 2n)
    return new Field(this.big * d.big)
  }

  negate () : Field {
    return new Field(Field.N - this.big)
  }

  generate () : Point {
    return Point.import(NoblePoint.BASE.multiply(this.big))
  }
}

export class Point {
  static N = secp.CURVE.n

  static validate (x : PointValue) : boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      x = new Point(x)
      return true
    } catch { return false }
  }

  static normalize (x : PointValue) : ECPoint {
    let bytes = normalizePoint(x)
    if (bytes.length === 32) {
      bytes = bytes.prepend(0x02)
    }
    return NoblePoint.fromHex(bytes.hex)
  }

  static generate (value : FieldValue) : Point {
    return new Field(value).generate()
  }

  static import (point : Point | ECPoint) : Point {
    const p = (point instanceof Point)
      ? { x: point.x.big, y: point.y.big }
      : { x: point.x, y: point.y }
    return new Point(p.x, p.y)
  }

  readonly __p : ECPoint

  constructor (x : PointValue, y ?: bigint) {
    this.__p = (
      typeof x === 'bigint' &&
      typeof y === 'bigint'
    )
      ? new NoblePoint(x, y, 1n)
      : Point.normalize(x)
    this.p.assertValidity()
  }

  get p () : ECPoint {
    return this.__p
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

  eq (value : PointValue) : boolean {
    return (value instanceof Point)
      ? this.p.equals(new NoblePoint(value.x.big, value.y.big, 1n))
      : (value instanceof Uint8Array)
        ? this.x.big === Buff.raw(value).big
        : (typeof value === 'number')
          ? BigInt(value) === this.x.big
          : value === this.x.big
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
      : Point.import(this.p.multiply(normalizeField(value)))
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
    typeof value === 'string'   ||
    typeof value === 'number'   ||
    typeof value === 'bigint'
  ) {
    return Buff.bytes(value)
  }
  throw TypeError('Invalid input type:' + typeof value)
}
