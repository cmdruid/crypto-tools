import { Buff }  from '@cmdcode/buff-utils'
import { Field } from '../src/ecc.js'

const x = new Field('ab'.repeat(32))
const y = new Field('de'.repeat(32))

const s = x.mul(y)
const n = s.div(y)

console.log('s:', s.hex)
console.log('n:', n.hex)