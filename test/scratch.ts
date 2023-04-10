import * as Noble from '@cmdcode/secp256k1'

const seckey = Noble.utils.randomPrivateKey()
const pubkey = Noble.schnorr.getPublicKey(seckey)

const msg = Noble.utils.randomBytes(32)
const sig = await Noble.schnorr.sign(msg, seckey)

const isValid = await Noble.schnorr.verify(sig, msg, pubkey)

console.log('Signature is valid:', isValid)
