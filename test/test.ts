import tape from 'tape'

import derivetest from './src/derive.test.js'
import dlctest    from './src/dlc.test.js'
import ecctest    from './src/ecc.test.js'
import ecdhtest   from './src/ecdh.test.js'
import sigtest    from './src/sig.test.js'
import stresstest from './src/stress.test.js'
import tweaktests from './src/tweak.test.js'

tape('crypto-utils test suite', async t => {

  t.test('ECC Tests', t => {
    ecctest(t)
    sigtest(t)
    dlctest(t)
    ecdhtest(t)
    stresstest(t)
    tweaktests(t)
    derivetest(t)
  })
})
