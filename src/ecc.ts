import { Buff, Bytes } from '@cmdcode/buff-utils'
import * as Noble      from '@noble/secp256k1'

type FieldNum = string | number | bigint | Uint8Array | Field
type PointNum = string | number | bigint | Uint8Array | Point

export class Field extends Uint8Array {
  static N = Noble.CURVE.n

  static mod (n : bigint, m = Field.N) : bigint {
    return Noble.utils.mod(n, m)
  }

  static isField = (x : any) : boolean => x instanceof Field

  static normalize (num : FieldNum) : Uint8Array {
    num = normalize(num)
    num = Field.mod(num)
    num = Noble.utils._normalizePrivateKey(num)
    return Buff.big(num, 32).toBytes()
  }

  static validate (num : bigint) : boolean {
    return Noble.utils.isValidPrivateKey(num)
  }

  constructor (num : FieldNum) {
    num = Field.normalize(num)
    super(num)
  }

  get num () : bigint {
    const rev = new Uint8Array(this)
    return Buff.buff(rev).toBig()
  }

  get point () : Point {
    return Point.fromNum(this.num)
  }

  get hasOddY () : boolean {
    return this.point.hasOddY
  }

  get negated () : Field {
    return (this.hasOddY)
      ? this.negate()
      : this
  }

  gt (num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num > this.num
  }

  lt (num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num < this.num
  }

  eq (num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num === this.num
  }

  ne (num : FieldNum) : boolean {
    const x = new Field(num)
    return x.num !== this.num
  }

  add (num : FieldNum) : Field {
    const x = new Field(num)
    return new Field(this.num + x.num)
  }

  sub (num : FieldNum) : Field {
    const x = new Field(num)
    return new Field(this.num - x.num)
  }

  mul (num : FieldNum) : Field {
    const x = new Field(num)
    return new Field(this.num * x.num)
  }

  pow (num : FieldNum, n = Field.N - 1n) : Field {
    const x = new Field(num)
    const exp = Field.mod(x.num, n)
    return new Field(this.num ** exp)
  }

  div (num : FieldNum) : Field {
    const x = new Field(num)
    const divisor = this.pow(x.num, Field.N - 2n)
    return new Field(this.num * divisor.num)
  }

  negate () : Field {
    return new Field(Field.N - this.num)
  }
}

export class Point {
  static N = Noble.CURVE.n

  static normalize (num : PointNum) : bigint {
    return normalize(num)
  }

  static fromNum (num : PointNum) : Point {
    num = Point.normalize(num)
    const f = Noble.utils.mod(num, Point.N)
    const P = Noble.Point.BASE.multiply(f)
    return new Point(P.x, P.y)
  }

  static fromXOnly (x : PointNum) : Point {
    x = Point.normalize(x)
    const h = Buff.big(x, 32).toHex()
    return Point.from(Noble.Point.fromHex(h))
  }

  static from (point : Point | Noble.Point) : Point {
    return new Point(point.x, point.y)
  }

  private readonly __p : Noble.Point
  private readonly __x : bigint
  private readonly __y : bigint

  constructor (x : bigint, y : bigint) {
    this.__p = new Noble.Point(x, y)
    this.__x = this.__p.x
    this.__y = this.__p.y
    this.__p.assertValidity()
  }

  get p () : Noble.Point {
    return this.__p
  }

  get hasOddY () : boolean {
    return !this.__p.hasEvenY()
  }

  get rawX () : Uint8Array {
    const prefix = this.__p.hasEvenY() ? 0x02 : 0x03
    const buffer = Buff.big(this.__x)
    return Uint8Array.of(prefix, ...buffer)
  }

  get rawXR () : Uint8Array {
    const prefix = this.__p.hasEvenY() ? 0x02 : 0x03
    const buffer = Buff.big(this.__x)
    return Uint8Array.of(prefix, ...buffer)
  }

  get rawY () : Uint8Array {
    return Buff.big(this.__y)
  }

  get x () : bigint {
    return this.__x
  }

  get y () : bigint {
    return this.__y
  }

  eq (x : PointNum) : boolean {
    return (x instanceof Point)
      ? this.p.equals(new Noble.Point(x.x, x.y))
      : (x instanceof Uint8Array)
        ? this.x.toString() === x.toString()
        : (typeof x === 'number')
          ? BigInt(x) === this.x
          : x === this.x
  }

  add (x : PointNum) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.add(x.p))
      : Point.from(this.p.add(Point.fromNum(x).p))
  }

  sub (x : PointNum) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.subtract(x.p))
      : Point.from(this.p.subtract(Point.fromNum(x).p))
  }

  mul (x : PointNum) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.multiply(x.x))
      : Point.from(this.p.multiply(Point.normalize(x)))
  }

  negate () : Point {
    return Point.from(this.__p.negate())
  }
}

export class KeyPair {
  private readonly _secret : Uint8Array

  static generate () : KeyPair {
    return new KeyPair(Buff.random(32))
  }

  constructor (secret : Bytes) {
    this._secret = Buff.normalize(secret, 32)
  }

  get field () : Field {
    return new Field(this._secret)
  }

  get point () : Point {
    return this.field.point
  }

  get privateKey () : Uint8Array {
    return new Uint8Array(this.field)
  }

  get privateHex () : string {
    return new Buff(this.field).toHex()
  }

  get publicKey () : Uint8Array {
    return new Uint8Array(this.point.rawX)
  }

  get publicHex () : string {
    return new Buff(this.publicKey).toHex()
  }

  get xOnlyPub () : Uint8Array {
    return this.publicKey.slice(1, 33)
  }

  get prvkey () : string {
    return this.privateHex
  }

  get pubkey () : string {
    return new Buff(this.xOnlyPub).toHex()
  }
}

function normalize (num : FieldNum | PointNum) : bigint {
  if (num instanceof Uint8Array) {
    return Buff.buff(num).toBig()
  }
  if (typeof num === 'string') {
    return Buff.hex(num).toBig()
  }
  if (typeof num === 'number') {
    return BigInt(num)
  }
  if (typeof num === 'bigint') {
    return num
  }
  throw TypeError('Invalid input type:' + typeof num)
}
