import { gen_keypair }          from '../src/keys.js'

import {
  create_proof,
  parse_proof,
  verify_proof,
  create_event
} from '../src/proof.js'

// Configure a demo keypair and message.
const [ seckey, pubkey ] = gen_keypair(true)

// Create a proof
const data   = { name : 'bob', key : 'abcd' }
const stamp  = Math.floor(Date.now() / 1000)
const params = [[ 'kind', 10000 ], [ 'stamp', stamp ]]
const proof  = create_proof(seckey, data, params)
console.log('proof:', proof)
// Verify a proof
const is_valid = verify_proof(proof, data)
console.log('is_valid:', is_valid)
// Parse a proof into a ProofData object
const proof_data = parse_proof(proof)
console.log('proof data:', proof_data)
// Convert a proof into a nostr note.
const event = create_event(proof, data)
console.log('event:', event)