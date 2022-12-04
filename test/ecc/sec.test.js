import { Buff }  from '@cmdcode/bytes-utils'
import * as ECC  from '../../src/ecc.js'
import * as Rand from '../../src/rand.js'

const { Field, Point } = ECC

export default function secretsTest(t) {
  t.test('Testing Shared Secret Derivation', async t => {

    // Setup our A, B, C keypairs.
    const a = Field.fromPrivate(Rand.getRandBytes(32))
    const A = Point.from(a.point)
    const b = Field.fromPrivate(Rand.getRandBytes(32))
    const B = Point.from(b.point)
    const sharedAB = A.mul(b.num).x
    const sharedBA = B.mul(a.num).x

    // const c = Field.fromPrivate(Rand.getRandBytes(32))
    // const C = Point.from(c.point)

    // const G = A.add(B).add(C)

    // const groupA = B.mul(a.num).add(A).x
    // const groupB = G.mul(b.num).add(B).x
    // const groupC = G.mul(c.num).add(C).x

    // console.log('point:', G)
    // console.log('groupA:', groupA)
    // console.log('groupB:', groupB)
    // console.log('groupC:', groupC)

    t.plan(1)
    t.equal(sharedAB, sharedBA, 'shared secrets should be equal.')
    // t.equal(groupA, groupB, 'group A -> B secrets are equal.')
    // t.equal(groupC, groupB, 'group B -> C secrets are equal.')
  })
}