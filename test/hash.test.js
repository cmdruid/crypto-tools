import test from 'tape'
import { test160 } from '../src/ripemd160.js'

test('ripemd', t => {
  t.test('Run test160', async t => {
    t.plan(1)
    t.ok(test160(), 'should pass all test vectors.')
  })
})
