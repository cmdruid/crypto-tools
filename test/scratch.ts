import { Field, Point } from '../src/ecc.js'
import { digest }       from '../src/hash.js'

const message   = 'dead'.repeat(16)
const secret    = 'beef'.repeat(16)
const pubkey    = Field.mod(secret).negated.point
const nonce     = digest('BIP0340/nonce', secret, pubkey.x, message)
const R_value   = Field.mod(nonce).negated.point
const challenge = digest('BIP0340/challenge', R_value.x, pubkey.x, message)
const s_value   = Field.mod(secret).negated.mul(challenge).add(nonce)

console.log('signature:', R_value.x.hex + s_value.hex)

const r_value = Field.mod(s_value).point.sub(pubkey.mul(challenge))

console.log('is valid:', R_value.hex === r_value.hex)
