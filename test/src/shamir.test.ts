import test     from 'tape'
import { Buff } from '@cmdcode/buff'

import {
  create_shares,
  combine_shares
} from '../../src/shamir.js'

const ROUNDS = 100

const random = (range : number) => Math.floor(Math.random() * range ?? 100)

export default function () {
  test('Testing shamir secret generation:', t => {

    t.plan(1)
    
    // Store results in an array.
    const results : boolean[] = []
    // Try to run the test for x rounds:
    try {
      for (let i = 0; i < ROUNDS; i++) {
        // Generate a secret and params.
        const secret = Buff.random(32)
        const thold  = random(100)
        const total  = thold + random(50)
        // Create secret shares.
        const shares = create_shares(secret, thold, total)
        // Sort shares randomly.
        shares.sort(() => Math.random() - 0.5)
        // Use t = threshold shares to compute secret.
        const result = combine_shares(shares.slice(0, thold + 1))
        // Push result to array.
        results.push(secret.hex === result.hex)
      }
    } catch (err) {
      const { message } = err as Error
      t.fail(message)
    }
    t.true(results.every(e => e === true), 'All shamir tests passed.')
  })
}
