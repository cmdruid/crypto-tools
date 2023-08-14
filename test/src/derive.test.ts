import { Test } from 'tape'
import { hd }   from '../../src/index.js'

import test_vectors from './vectors/derive.vectors.json' assert { type: "json" }
import { parse_ext_key } from '../../src/keys.js'

export default async function (t : Test) {
  const results : [ boolean, string ][] = []
  for (let i = 0; i < test_vectors.length; i++) {

    const { seed, vectors } = test_vectors[i]

    for (let j = 0; j < vectors.length; j++) {
      const [ path, xprvTarget ] = vectors[j]

      const [ key ] = hd.derive(path, seed)

      const { key: target } = parse_ext_key(xprvTarget)

      results.push([
        key.hex === target, 
        `Test vector ${i}.${j}`
      ])
    }
  }
  t.test('Testing key derivation.', t => {
    const fail = results.filter(e => e[0] === false)
    t.plan(1)
    t.equal(fail.length, 0, 'All derivation tests should pass.')
  })
}
