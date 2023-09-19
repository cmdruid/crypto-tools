// import { Buff } from '@cmdcode/buff'
// import { get_seckey, gen_keypair } from '../src/keys.js'
// import { sign_msg, recover_key }   from '../src/sig.js'

// // Configure hot / cold key-pairs and a message.
// const [ hot_sec, hot_pub ]   = gen_keypair(true)
// const [ cold_sec, cold_pub ] = gen_keypair(true)
// const message = Buff.str('testing ECDH key recovery').digest
// // Sign a message to produce a signature.
// const sig = sign_msg(message, hot_sec, { recovery_key: cold_pub })
// // Use the signature to recovery the secret key.
// const rec_key = recover_key(sig, message, hot_pub, cold_sec)

// console.log('hot secret key :', get_seckey(hot_sec, true).hex)
// console.log('recovered key  :', rec_key.hex)

import { create_shares, combine_shares } from '../src/shamir.js'

const secret = '3d60ddbdb2538c6b888203c3ed36b03a91e9873cbc87d94e9d00866992d8d7d5' // Our secret as a BigInt
const thold  = 3 // Minimum shares required to reconstruct the secret
const total  = 5 // Number of shares to create

console.log('Original secret:', secret)
const shares = create_shares(secret, thold, total)
console.log("Shares created:", shares)

const combined = combine_shares(shares.slice(0, thold))
console.log("Reconstructed secret:", combined.hex)
