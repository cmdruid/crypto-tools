import { Buff } from '@cmdcode/bytes-utils'
import * as Noble from '@noble/secp256k1'

class Field extends Uint8Array {

  static N = Noble.CURVE.n

  static mod(n : bigint, m = Field.N) : Field {
    return new Field(Noble.utils.mod(n, m))
  }

  static isField = (x : any) : boolean => x instanceof Field

  constructor(num : bigint | Uint8Array) {
    num = (typeof num === 'bigint') 
      ? Buff.big(num).reverse()
      : num
    super(num)
  }

  get num() : bigint {
    const rev = new Uint8Array(this).reverse()
    return Buff.buff(rev).toBig()
  }

  get point() : Point {
    return Point.fromScalar(this.num)
  } 

  gt(num : Field | bigint | Uint8Array) : boolean {
    const x = new Field(num)
    return x.num > this.num
  }

  lt(num : Field | bigint | Uint8Array) : boolean {
    const x = new Field(num)
    return x.num < this.num
  }

  eq(num : Field | bigint | Uint8Array) : boolean {
    const x = new Field(num)
    return x.num === this.num
  }

  ne(num : Field | bigint | Uint8Array) : boolean {
    const x = new Field(num)
    return x.num !== this.num
  }

  add(num : Field | bigint | Uint8Array) : Field {
    const x = new Field(num)
    return Field.mod(this.num + x.num)
  }

  sub(num : Field | bigint | Uint8Array) : Field {
    const x = new Field(num)
    return Field.mod(this.num - x.num)
  }

  mul(num : Field | bigint | Uint8Array) : Field {
    const x = new Field(num)
    return Field.mod(this.num * x.num)
  }

  pow(num : Field | bigint | Uint8Array, n = Field.N - 1n) : Field {
    const x = new Field(num)
    const exp = Field.mod(x.num, n)
    return Field.mod(this.num ** exp.num)
  }

  div(num : Field | bigint | Uint8Array) : Field {
    const x = new Field(num)
    const divisor = this.pow(x.num, Field.N - 2n)
    return Field.mod(this.num * divisor.num)
  }
}

class Point {

  static fromScalar(x : number | bigint | Uint8Array) : Point {
    const b = (x instanceof Uint8Array)
      ? Buff.buff(x.reverse()).toBig()
      : (typeof x === 'number')
        ? BigInt(x)
        : x
    const p = Noble.Point.BASE.multiply(b)
    return new Point(p.x, p.y)
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
    return Uint8Array.of(prefix, ...buffer.reverse())
  }

  get rawXR() : Uint8Array {
    const prefix = this.__p.hasEvenY() ? 0x02 : 0x03
    const buffer = Buff.big(this.__x)
    return Uint8Array.of(prefix, ...buffer)
  }
  
  get rawY() : Uint8Array {
    return Buff.big(this.__y).reverse()
  }

  get x() : bigint {
    return this.__x
  }

  get y() : bigint {
    return this.__y
  }

  eq(x : Point | Uint8Array | bigint) : boolean {
    return (x instanceof Point)
      ? this.p.equals(new Noble.Point(x.x, x.y))
      : (x instanceof Uint8Array)
        ? this.x.toString() === x.toString()
        : x === this.x
  }

  add(x : Point | Uint8Array | bigint) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.add(x.p))
      : Point.from(this.p.add(Point.fromScalar(x).p))
  }

  sub(x : Point | Uint8Array | bigint) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.subtract(x.p))
      : Point.from(this.p.subtract(Point.fromScalar(x).p))
  }
  
  mul(x : Point | Uint8Array | bigint) : Point {
    return (x instanceof Point)
      ? Point.from(this.p.multiply(x.x))
      : Point.from(this.p.multiply(Point.fromScalar(x).x))
  }
}


export {
  Field,
  Point,
  Noble
}
