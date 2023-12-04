import test from 'tape'

import derivetest from './src/derive.test.js'
import dlctest    from './src/dlc.test.js'
import ecctest    from './src/ecc.test.js'
import ecdhtest   from './src/ecdh.test.js'
import keystest   from './src/keys.test.js'
import prooftest  from './src/proof.test.js'
import sigtest    from './src/sig.test.js'
import shamirtest from './src/shamir.test.js'
import stresstest from './src/stress.test.js'
import tweaktests from './src/tweak.test.js'

test('Crypto Utils Test Suite', t => {
  ecctest()
  sigtest()
  dlctest()
  ecdhtest()
  keystest()
  prooftest()
  tweaktests()
  derivetest()
  shamirtest()
  stresstest()
  t.end()
})
