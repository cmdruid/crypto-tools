import { ecc, sha256, util } from '../dist/module.mjs'

const sec_key   = ecc.gen_seckey()
const message   = sha256(util.random())
const pubkey    = ecc.get_pubkey(sec_key, true)
const signature = ecc.sign(message, sec_key)
const isValid   = ecc.verify(signature, message, pubkey)

console.log('Signature is valid:', isValid)
console.log('message:', message.hex)