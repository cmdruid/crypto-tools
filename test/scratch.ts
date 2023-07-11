import { Point } from '../src/ecc.js'
import { util } from '../src/index.js'

const num = util.random(32)

const P = Point.generate(num)

const infinity = Point.zero

// const inf_add = P.add(infinity)

console.log(infinity)
