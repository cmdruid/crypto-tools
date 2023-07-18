import { Buff } from '@cmdcode/buff-utils'
import { ecc, ecdh, util } from '../src/index.js'

const msg = Buff.str('the weather is sunny!')
const [ a_sec, a_pub ] = ecc.get_keypair(util.random(32))
const [ b_sec, b_pub ] = ecc.get_keypair(util.random(32))

const a_shared = ecdh.get_shared_code(a_sec, b_pub, { aux: msg })
const b_shared = ecdh.get_shared_code(b_sec, a_pub, { aux: msg })

console.log('a code:', a_shared.hex)
console.log('b code:', b_shared.hex)