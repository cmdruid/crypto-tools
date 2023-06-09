import { Buff } from '@cmdcode/buff-utils'
import { Field, Point } from '../src/ecc.js'
import { secp256k1 as secp } from '@noble/curves/secp256k1.js'

const secret  = new Field('ab'.repeat(32))
const message = new Field('de'.repeat(32))

const s = secret.mul(message)

console.log('s:', s.big)

const n = s.div(message)

console.log('n:', n.hex)

// div (big : FieldValue) : Field {
//     const x = new Field(big)
//     const d = this.pow(x.big, Field.N - 2n)
//     return new Field(this.big * d.big)
//   }

