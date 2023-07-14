import { ecc, sha256, util } from '../dist/module.mjs'

const sec_key   = ecc.gen_seckey()
const message   = sha256(util.random())
const pubkey    = ecc.get_pubkey(sec_key, true)
const signature = ecc.sign(message, sec_key)
const isValid   = ecc.verify(signature, message, pubkey)

console.log('Signature is valid:', isValid)
console.log('message:', message.hex)

console.log(pubkey.hex)
const newkey = util.normalize_x(pubkey)
const xonly  = ecc.parse_x(newkey)

console.log(newkey.hex)
console.log(xonly.hex)