import { Buff } from '@cmdcode/buff-utils'
import { SecretKey, PublicKey } from '../src/keypair.js'
import { sign, verify } from '../src/signer.js'
import { Field, Point } from '../src/ecc.js'
import { hashTag } from '../src/utils.js'

const message = Buff.hex('c04a2a5e604416027bf34abad0061dd553b8b2a8c07453c7fa34825cc5358823')
const nonce   = Buff.hex('3d25130c20a3516308ca359f223a972c4fff2e0fe00f2018692bd0f38d22717b')

// const signatures : SignaturePair[] = []

// for (let i = 0; i < signers; i++) {
//   const seckey = SecretKey.random({ type: 'taproot' })
//   const pubkey = seckey.pub
//   const sig = sign(seckey, message)
//   signatures.push([ pubkey, sig ])
// }

// console.log('valid:', verifyAll(signatures, message))

/* Signer 1 */
const seckey1 = SecretKey.random()
const pubkey1 = seckey1.pub

console.log('seckey1 :', seckey1.hex)
console.log('pubkey1 :', pubkey1.hex)

/* Signer 2 */
const seckey2 = SecretKey.random()
const pubkey2 = seckey2.pub

console.log('seckey2 :', seckey2.hex)
console.log('pubkey2 :', pubkey2.hex)

const sig1   = seckey1.sign(message)
const nonce1 = new PublicKey(sig1.slice(0, 33))
const proof1 = new SecretKey(sig1.slice(33))

console.log('sig1    :', sig1.hex)
console.log('proof1  :', proof1.hex)
console.log('nonce1  :', nonce1.hex)

const sig2   = seckey2.sign(message)
const nonce2 = new PublicKey(sig2.slice(0, 33))
const proof2 = new SecretKey(sig2.slice(33))

console.log('sig2    :', sig2.hex)
console.log('proof2  :', proof2.hex)
console.log('nonce2  :', nonce2.hex)

const agg_pub = pubkey1.add(pubkey2)
const agg_proof  = proof1.add(proof2)
const agg_nonce  = nonce1.add(nonce2)
const agg_sig    = agg_nonce.buff.append(agg_proof)

console.log('agg_pub   :', agg_pub.hex)
console.log('agg_proof :', agg_proof.hex)

const isValid1  = seckey1.verify(sig1, message, { throws: true })
const isValid2  = seckey2.verify(sig2, message, { throws: true })
const isValidA  = verify(agg_sig, message, agg_pub, { throws: true })

console.log('isValid1:', isValid1)
console.log('isValid2:', isValid2)
console.log('isValidA:', isValidA)

const s1p = proof1.pub
const s2p = proof2.pub
console.log('s1p:', s1p.hex)
console.log('s2p:', s2p.hex)
console.log('combined:', s1p.add(s2p).hex)
console.log('proof:', agg_proof.pub.hex)
