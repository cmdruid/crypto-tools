import { Buff }   from '@cmdcode/buff-utils'
import * as Noble from '@cmdcode/secp256k1'

type FieldValue = string | number | bigint | Uint8Array | Field
type PointValue = string | number | bigint | Uint8Array | Point

export class Field extends Uint8Array {
  static N = Noble.CURVE.n

  static mod (n : bigint, m = Field.N) : bigint {
    return Noble.utils.mod(n, m)
  }

  static normalize (num : FieldValue) : Uint8Array {
    num = normalizeField(num)
    num = Field.mod(num)
    Field.validate(num)
    return Buff.big(num, 32)
  }

  static validate (num : bigint) : boolean {
    return Noble.utils.isValidPrivateKey(num)
  }

  constructor (x : FieldValue) {
    super(Field.normalize(x))
  }

  get buff () : Buff {
    return new Buff(this)
  }

  get raw () : Uint8Array {
    return this.buff.raw
  }

  get num () : bigint {
    return this.buff.big
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

  gt (num : FieldValue) : boolean {
    const x = new Field(num)
    return x.num > this.num
  }

  lt (num : FieldValue) : boolean {
    const x = new Field(num)
    return x.num < this.num
  }

  eq (num : FieldValue) : boolean {
    const x = new Field(num)
    return x.num === this.num
  }

  ne (num : FieldValue) : boolean {
    const x = new Field(num)
    return x.num !== this.num
  }

  add (num : FieldValue) : Field {
    const x = new Field(num)
    return new Field(this.num + x.num)
  }

  sub (num : FieldValue) : Field {
    const x = new Field(num)
    return new Field(this.num - x.num)
  }

  mul (num : FieldValue) : Field {
    const x = new Field(num)
    return new Field(this.num * x.num)
  }

  pow (num : FieldValue, n = Field.N - 1n) : Field {
    const x = new Field(num)
    const e = Field.mod(x.num, n)
    return new Field(this.num ** e)
  }

  div (num : FieldValue) : Field {
    const x = new Field(num)
    const d = this.pow(x.num, Field.N - 2n)
    return new Field(this.num * d.num)
  }

  negate () : Field {
    return new Field(Field.N - this.num)
  }

  generate () : Point {
    return Point.import(Noble.Point.BASE.multiply(this.big))
  }
}

export class Point {
  static N = Noble.CURVE.n

  static validate (x : PointValue) : boolean {
    try {
      x = new Point(x)
      return true
    } catch { return false }
  }

  static normalize (x : PointValue) : Noble.Point {
    x = normalizePoint(x)
    return Noble.Point.fromHex(x)
  }

  static generate (num : FieldValue) : Point {
    return new Field(num).generate()
  }

  static import (point : Point | Noble.Point) : Point {
    return new Point(point.x, point.y)
  }

  readonly __p : Noble.Point

  constructor (x : PointValue, y ?: bigint) {
    this.__p = (
      typeof x === 'bigint' &&
      typeof y === 'bigint'
    )
      ? new Noble.Point(x, y)
      : Point.normalize(x)
    this.p.assertValidity()
  }

  get p () : Noble.Point {
    return this.__p
  }

  get x () : bigint {
    return this.p.x
  }

  get y () : bigint {
    return this.p.y
  }

  get buff () : Buff {
    const p = this.p.toRawBytes(true)
    if (p.length < 33) {
      const prefix = this.p.hasEvenY() ? 0x02 : 0x03
      return Buff.of(prefix, ...p)
    } else { return Buff.raw(p) }
  }

  get buffX () : Buff {
    return new Buff(getXonly(this.buff))
  }

  get raw () : Uint8Array {
    return this.buff.raw
  }

  get rawX () : Uint8Array {
    return this.buffX.raw
  }

  get rawY () : Uint8Array {
    return Buff.big(this.y).raw
  }

  get hex () : string {
    return this.buff.hex
  }

  get hexX () : string {
    return this.buffX.hex
  }

  get hasEvenY () : boolean {
    return this.p.hasEvenY()
  }

  get hasOddY () : boolean {
    return !this.p.hasEvenY()
  }

  eq (x : PointValue) : boolean {
    return (x instanceof Point)
      ? this.p.equals(new Noble.Point(x.x, x.y))
      : (x instanceof Uint8Array)
        ? this.x.toString() === x.toString()
        : (typeof x === 'number')
          ? BigInt(x) === this.x
          : x === this.x
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

  mul (x : PointValue) : Point {
    return (x instanceof Point)
      ? Point.import(this.p.multiply(x.x))
      : Point.import(this.p.multiply(normalizeField(x)))
  }

  negate () : Point {
    return Point.import(this.p.negate())
  }
}

function getXonly (x : Uint8Array) : Uint8Array {
  return (x.length > 32) ? x.slice(1, 33) : x
}

function normalizeField (value : FieldValue | PointValue) : bigint {
  if (value instanceof Field) {
    return value.num
  }
  if (value instanceof Point) {
    return value.x
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

function normalizePoint (value : FieldValue | PointValue) : string {
  if (value instanceof Field) {
    return value.hex
  }
  if (value instanceof Point) {
    return value.hex
  }
  if (value instanceof Uint8Array) {
    return Buff.raw(value).hex
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return Buff.num(value).hex
  }
  if (typeof value === 'bigint') {
    return Buff.big(value).hex
  }
  throw TypeError('Invalid input type:' + typeof value)
}
