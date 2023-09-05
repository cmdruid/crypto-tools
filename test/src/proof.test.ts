import test from 'tape'

import {
  create_proof,
  validate_proof,
  verify_proof
} from '../../src/proof.js'

import pass_vectors from './vectors/proof.vectors.json' assert { type : 'json' }

const DEFAULT_OPT = { aux : null, throws: true }

export default function () {
  test('Testing proof generation:', t => {
    t.plan(3 * pass_vectors.length)
    for (const v of pass_vectors) {
      const { content, secret, params, proof: expected } = v
      const actual = create_proof(secret, content, params, DEFAULT_OPT)
      t.equal(actual, expected, 'Both proof strings should be identical.')
      t.true(validate_proof(v.proof), 'The proof string should be valid.')
      try {
        t.true(verify_proof(actual, content, DEFAULT_OPT), 'The proof signature should be valid.')
      } catch (err) {
        const { message } = err as Error
        t.fail(message)
      }
    }
  })
}
