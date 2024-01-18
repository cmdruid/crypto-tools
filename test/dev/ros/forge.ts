/**
 * Resources:
 *   - On the insecurity of ROS:
 *     https://eprint.iacr.org/2020/945.pdf
 *
 * Points:
 *   + The wagner attack (and birthday paradox)
 *     involves finding key collisions in parallel.
 *   + The parallelization attack takes advantage of
 *     multiple rounds of signing using the same key.
 *   + A solution to this attack is to rotate the
 *     signing keys frequently, or use a unique key
 *     for each signature session.
 *   + Any solution that prevents an attacker from
 *     gaining multiple signatures for a particular
 *     key should work.
 *   + Musig was affected by this. Not sure if Musig2
 *     is still affected (need to ask Jonathan).
 */

import { Buff, Bytes } from '@cmdcode/buff'
import { Field, keys, math }  from '../src/lib/index.js'
import { _P, _G, _N } from '../src/const.js'

type Entry = [ Bytes, Bytes ]

const { fd, GF } = math

const Zq = GF(_P, 32)
const Zp = GF(_N)

const table = new Map<string, bigint>()

// Sessions
const sct = range(256)
// Challenges
const chl : bigint[][] = []

// Generate sec keys.
const seckeys = sct.map(_ => Field.random())
// Generate sec nonces.
const nonces  = sct.map(_ => Field.random())
// Generate challenges.
for (const sn of nonces) {
  const o : bigint[] = []
  for (const i of [ '00', '01' ]) {
    const key = sn.point.hex + i
    o.push(random_oracle(key))
  }
  chl.push(o)
}

const P = forge_point()

function random_oracle (key : string) {
  if (!table.has(key)) {
    table.set(key, Field.random().big)
  }
  return table.get(key) as bigint
}

function forge_point (
  chl : [ bigint, bigint ][]
) : [ bigint, bigint ] {
  const x = sct.map(i => {
    const diff = chl[i][1] - chl[i][0]
    return Field.mod(2).pow(i).mul(chl[i][0]).div(diff).big
  }).reduce((pre, nxt) => pre + nxt, 0n) * - 1n
  const y = sct.map(i => {
    const diff = chl[i][1] - chl[i][0]
    return Field.mod(2).pow(i).div(diff).big
  })
  return [ x, y ]
}

function range (
  max  : number,
  min  = 0,
  step = 1
) {
  const arr = new Array<number>((max - min) / step)
  for (let i = min; i < max; i += step) {
    arr.push(i)
  }
  return arr
}