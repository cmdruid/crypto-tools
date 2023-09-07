import { Buff } from '@cmdcode/buff'
import { get_seckey, gen_keypair } from '../src/keys.js'
import { sign_msg, recover_key }   from '../src/sig.js'

// Configure hot / cold key-pairs and a message.
const [ hot_sec, hot_pub ]   = gen_keypair(true)
const [ cold_sec, cold_pub ] = gen_keypair(true)
const message = Buff.str('testing ECDH key recovery').digest
// Sign a message to produce a signature.
const sig = sign_msg(message, hot_sec, { recovery_key: cold_pub })
// Use the signature to recovery the secret key.
const rec_key = recover_key(sig, message, hot_pub, cold_sec)

console.log('hot secret key :', get_seckey(hot_sec, true).hex)
console.log('recovered key  :', rec_key.hex)
