import { secp256k1 }       from '@noble/curves/secp256k1'
import { Field, mod, pow } from '@noble/curves/abstract/modular'
import { PointData }       from './types.js'

export {
  mod,
  pow,
  pow2,
  invert
} from '@noble/curves/abstract/modular'

export const curve = secp256k1.CURVE

const N = curve.n
const P = curve.p

const G : PointData = { x: curve.Gx, y: curve.Gy }

const _0n = BigInt(0)
const _1n = BigInt(1)
const _2n = BigInt(2)
const _3n = BigInt(3)
const _4n = BigInt(4)

export const CONST = { N, P, G, _0n, _1n, _2n, _3n, _4n }

export const ecc   = Field(N, 32, true)

export const modN = (x : bigint) : bigint => mod(x, N)
export const modP = (x : bigint) : bigint => mod(x, P)

export const powN = (x : bigint, exp : bigint) : bigint => pow(x, exp, N)

export const on_curve = (x : bigint) : boolean => {
  return typeof x === 'bigint' && _0n < x && x < P
}
export const in_field = (x : bigint) : boolean => {
  return typeof x === 'bigint' && _0n < x && x < N
}

const Point = secp256k1.ProjectivePoint

function is_even (p : PointData) : boolean {
  const pa = new Point(p.x, p.y, _1n)
  return pa.hasEvenY()
}

function is_valid (
  p : PointData | null
) : boolean {
  if (p === null) return false
  const pt = new Point(p.x, p.y, _1n)
  try {
    pt.assertValidity()
    return true
  } catch { return false }
}

function assert_valid (
  p : PointData | null
) : asserts p is PointData {
  if (!is_valid(p)) {
    throw new TypeError('Point is invalid!')
  }
}

function point_negate (
  a : PointData
) : PointData | null {
  const pa = new Point(a.x, a.y, _1n)
  try {
    const pc = pa.negate()
    pc.assertValidity()
    return { x: pc.x, y: pc.y }
  } catch { return null }
}

function point_add (
  a : PointData,
  b : PointData
) : PointData | null {
  const pa = new Point(a.x, a.y, _1n)
  const pb = new Point(b.x, b.y, _1n)
  try {
    const pc = pa.add(pb)
    pc.assertValidity()
    return { x: pc.x, y: pc.y }
  } catch { return null }
}

function point_sub (
  a : PointData,
  b : PointData
) : PointData | null {
  const pa = new Point(a.x, a.y, _1n)
  const pb = new Point(b.x, b.y, _1n)
  try {
    const pc = pa.subtract(pb)
    pc.assertValidity()
    return { x: pc.x, y: pc.y }
  } catch { return null }
}

function point_mul (
  a : PointData,
  b : bigint
) : PointData | null {
  const pa = new Point(a.x, a.y, _1n)
  try {
    const pc = pa.multiply(b)
    pc.assertValidity()
    return { x: pc.x, y: pc.y }
  } catch { return null }
}

export const point = {
  is_even,
  is_valid,
  assert_valid,
  P      : Point,
  add    : point_add,
  sub    : point_sub,
  mul    : point_mul,
  negate : point_negate
}
