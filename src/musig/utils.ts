import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from '../ecc.js'
// import { isValidField } from '../schema/validate.js'
import { hashTag }      from '../utils.js'

function hash_keys (keys : Bytes[]) : Buff {
  return hashTag('KeyAgg list', Buff.join(keys))
}

export function coeff (
  group  : Bytes[],
  pubkey : Bytes
) : Field {
  const hash = hash_keys(group)
  if (group[1] === pubkey) {
    pubkey = 1
  }
  const h = hashTag('KeyAgg coefficient', hash, pubkey)
  return new Field(h)
}

export function cpoint (pubkey : Bytes) : Point {
  // Normalize bytes.
  const x = Buff.bytes(pubkey)
  // Check length of pubkey.
  if (x.length !== 33) {
    throw new Error(`Invalid key length: ${x.hex}`)
  }
  // Init cbyte and point.
  const cbyte = x[0]
  const point = new Point(x.slice(1, 33))
  // Return point object based on cbyte.
  switch (cbyte) {
    case 0x02:
      return point
    case 0x03:
      return point.negate()
    default:
      throw new Error(`Invalid key prefix: ${x.hex}`)
  }
}
