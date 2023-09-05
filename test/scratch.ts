import { gen_keypair }          from '../src/keys.js'
import { sign_msg, verify_sig } from '../src/sig.js'
// Configure a demo keypair and message.
const [ seckey, pubkey ] = gen_keypair(true)
const message  = 'abcd1234'.repeat(4)
// Sign the message, then validate the signature.
const sig      = sign_msg(message, seckey)
const is_valid = verify_sig(sig, message, pubkey)
// Check the console output.
console.log('signature:', sig.hex)
console.log('is_valid:', is_valid)