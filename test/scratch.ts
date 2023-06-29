import { Buff }  from '@cmdcode/buff-utils'
import { Field } from '../src/ecc.js'

const members = [ 'alice', 'bob', 'carol' ]
const wallets = []

for (let i = 0; i < members.length; i++) {
  wallets.push({
    name   : members[i],
    seckey : Buff.random()
    pubkey : lift_x
  })
}