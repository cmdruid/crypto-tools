import { Buff, Bytes } from '@cmdcode/buff-utils'
import * as Noble      from '@noble/secp256k1'

type FieldNum = number | bigint | Uint8Array | Field
type PointNum = number | bigint | Uint8Array | Point

export class Field extends Uint8Array {

  static N = Noble.CURVE.n

  static mod(n : bigint, m = Field.N) : bigint {
    return Noble.utils.mod(n, m)
  }

  static isField = (x : any) : boolean => x instanceof Field

  static fromPrivate(num : FieldNum) : Field {
    if (num <= 0) {
      throw new TypeError('Number cannot be negative.')
    }
    if (num >= Field.N) {
      throw new TypeError('Number cannot be greater than N: 2**256 - 2**32 - 977')
    }
    return new Field(num)
  }

  constructor(num : FieldNum) {
    num = (num instanceof Uint8Array)
      ? Buff.from(num).toBig()
      : (typeof num === 'number')
        ? BigInt(num)
        : num
    num = Buff.big(Field.mod(num), 32)
    super(num)
  }

  get num() : bigint {
    const rev = new Uint8Array(this)
    return Buff.buff(rev).toBig()
  }

  get point() : Point {
    return Point.fromScalar(this.num)
  } 

  gt(num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num > this.num
  }

  lt(num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num < this.num
  }

  eq(num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num === this.num
  }

  ne(num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num !== this.num
  }

  add(num : FieldNum) : Field {
    const x = new Field(num)
    return new Field(this.num + x.num)
  }

  sub(num : FieldNum) : Field {
    const x = new Field(num)
    return new Field(this.num - x.num)
  }

  mul(num : FieldNum) : Field {
    const x = new Field(num)
    return new Field(this.num * x.num)
  }

  pow(num : FieldNum, n = Field.N - 1n) : Field {
    const x = new Field(num)
    const exp = Field.mod(x.num, n)
    return new Field(this.num ** exp)
  }

  div(num : FieldNum) : Field {
    const x = new Field(num)
    const divisor = this.pow(x.num, Field.N - 2n)
    return new Field(this.num * divisor.num)
  }
}

export class Point {

  static N = Noble.CURVE.n

  static fromScalar(x : number | bigint | Uint8Array) : Point {
    const b = (x instanceof Uint8Array)
      ? Buff.from(x).toBig()
      : (typeof x === 'number')
        ? BigInt(x)
        : x
    const m = Noble.utils.mod(b, Point.N)
    const p = Noble.Point.BASE.multiply(m)
    return new Point(p.x, p.y)
  }

  static fromX(x : Uint8Array) : Point {
    const h = Buff.buff(x).toHex()
    return Point.from(Noble.Point.fromHex(h))
  }

  static from(point : Point | Noble.Point) : Point {
    return new Point(point.x, point.y)
  }

  private readonly __p : Noble.Point
  private readonly __x : bigint
  private readonly __y : bigint

  constructor(x: bigint, y : bigint) {
    this.__p = new Noble.Point(x, y)
    this.__x = this.__p.x
    this.__y = this.__p.y
  }

  get p() : Noble.Point {
    return this.__p
  }

  get rawX() : Uint8Array {
    const prefix = this.__p.hasEvenY() ? 0x02 : 0x03
    const buffer = Buff.big(this.__x)
    return Uint8Array.of(prefix, ...buffer)
  }

  get rawXR() : Uint8Array {
    const prefix = this.__p.hasEvenY() ? 0x02 : 0x03
    const buffer = Buff.big(this.__x)
    return Uint8Array.of(prefix, ...buffer)
  }
  
  get rawY() : Uint8Array {
    return Buff.big(this.__y)
  }

  get x() : bigint {
    return this.__x
  }

  get y() : bigint {
    return this.__y
  }

  eq(x : PointNum) : boolean {
    return (x instanceof Point)
      ? this.p.equals(new Noble.Point(x.x, x.y))
      : (x instanceof Uint8Array)
        ? this.x.toString() === x.toString()
        : (typeof x === 'number')
          ? BigInt(x) === this.x
          : x === this.x
  }

  add(x : PointNum) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.add(x.p))
      : Point.from(this.p.add(Point.fromScalar(x).p))
  }

  sub(x : PointNum) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.subtract(x.p))
      : Point.from(this.p.subtract(Point.fromScalar(x).p))
  }
  
  mul(x : PointNum) : Point {
    if (x instanceof Uint8Array) {
      const b = Buff.from(x).toBig()
      return Point.from(this.p.multiply(b))
    }
    return (x instanceof Point)
      ? Point.from(this.p.multiply(x.x))
      : Point.from(this.p.multiply(x))
  }
}

export class KeyPair {
  private readonly _secret : Uint8Array

  static generate() : KeyPair {
    return new KeyPair(Buff.random(32))
  }

  constructor(secret : Bytes) {
    this._secret = Buff.normalizeBytes(secret)
  }

  get field() : Field {
    return new Field(this._secret)
  }

  get point() : Point {
    return this.field.point
  }

  get privateKey() : Uint8Array {
    return new Uint8Array(this.field)
  }

  get privateHex() : string {
    return new Buff(this.field).toHex()
  }

  get publicKey() : Uint8Array {
    return new Uint8Array(this.point.rawX)
  }

  get publicHex() : string {
    return new Buff(this.publicKey).toHex()
  }

  get xOnlyPub() : Uint8Array {
    return this.publicKey.slice(1, 33)
  }
}
