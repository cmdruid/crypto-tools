import test from 'tape'

import { hd } from '../../src/index.js'

import test_vectors from './vectors/derive.vectors.json' assert { type: "json" }

export default function () {
  test('Testing key derivation', t => {
    const results : [ boolean, string ][] = []
    for (let i = 0; i < test_vectors.length; i++) {

      const { seed, vectors } = test_vectors[i]

      for (let j = 0; j < vectors.length; j++) {
        const [ path, xprvTarget ] = vectors[j]

        const hdkey = hd.derive_key(path, seed)
        const { seckey } = hdkey
        const xprv = hd.encode_extkey(hdkey)
        const { key: target } = hd.parse_extkey(xprvTarget)

        results.push([
          seckey?.hex === target && xprv === xprvTarget, 
          `Test vector ${i}.${j}`
        ])
      }
    }

    const fail = results.filter(e => e[0] === false)
    t.plan(1)
    if (fail.length !== 0) {
      console.log(fail)
      t.fail('Some derivation path tests failed!')
    } else {
      t.pass('All derivation tests should pass.')
    }
  })
}
