import { Buff } from '@cmdcode/buff-utils'
import { secp256k1 as secp } from '@noble/curves/secp256k1'

const seckey = secp.utils.randomPrivateKey()
const pubkey = secp.getPublicKey(seckey)

console.log('seckey:', Buff.raw(seckey).hex)
console.log('pubkey:', Buff.raw(pubkey).hex)

const { ProjectivePoint: Point } = secp

const pubkey2 = Point.fromPrivateKey(seckey)

console.log('Point:', pubkey2)

console.log('pubkey2:', Buff.big(pubkey2.px).hex)

// const msg = Noble.utils.randomBytes(32)
// const sig = await Noble.schnorr.sign(msg, seckey)

// const isValid = await Noble.schnorr.verify(sig, msg, pubkey)

// console.log('Signature is valid:', isValid)
