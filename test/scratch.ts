import { Point } from '../src/ecc.js'
import { math, util, assert } from '../src/index.js'

const { point } = math
const rand = util.random(32)

const pt1 = math.point.gen(rand)
const pt2 = math.point.gen(rand)
const pt3 = math.point.add(pt1, pt2)

assert.valid_pt(pt3)

console.log(pt3)

