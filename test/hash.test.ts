import test from 'tape'
import { test160 } from '../src/ripemd160'

test('ripemd', t => {
  t.test('Run test160', t => {
    t.plan(1)
    t.ok(test160(), 'should pass all test vectors.')
  })
})
