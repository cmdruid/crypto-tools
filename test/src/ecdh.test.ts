import { Test } from 'tape'
import { Field, util } from '../../src/index.js'

export default function secretsTest(t : Test) {
  t.test('Testing ECDH Shared Secret Derivation', async t => {

    const alice = new Field(util.random(32))
    const Alice = alice.point
    const bob   = new Field(util.random(32))
    const Bob   = bob.point
    const sharedAB = Bob.mul(alice).x.hex
    const sharedBA = Alice.mul(bob).x.hex

    t.plan(1)
    t.equal(sharedAB, sharedBA, 'shared secrets should be equal.')
  })
}