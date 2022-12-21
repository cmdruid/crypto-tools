import { Buff }  from '@cmdcode/buff-utils'
import * as ECC  from '../../src/ecc.js'

const { Field, Point } = ECC

export default function secretsTest(t) {
  t.test('Testing Shared Secret Derivation', async t => {

    // Setup our A, B, C keypairs.
    const a = Field.fromPrivate(Buff.random(32))
    const A = Point.from(a.point)
    const b = Field.fromPrivate(Buff.random(32))
    const B = Point.from(b.point)
    const sharedAB = B.mul(a.num).x
    const sharedBA = A.mul(b.num).x

    // const c = Field.fromPrivate(Buff.random(32))
    // const C = Point.from(c.point)

    // const groupA = B.mul(a.num).mul(C.mul(a.num))
    // const groupB = C.mul(b.num).mul(A.mul(b.num))
    // const groupC = A.mul(c.num).mul(B.mul(c.num))

    // console.log('groupA:', groupA)
    // console.log('groupB:', groupB)
    // console.log('groupC:', groupC)

    t.plan(1)
    t.equal(sharedAB, sharedBA, 'shared secrets should be equal.')
    // t.equal(groupA, groupB, 'group A -> B secrets are equal.')
    // t.equal(groupC, groupB, 'group B -> C secrets are equal.')
  })
}