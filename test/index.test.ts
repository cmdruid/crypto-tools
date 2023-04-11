import tape        from 'tape'
import CipherTest  from './cipher/cipher.test.js'
import SignerTest  from './signer/signer.test.js'
import ECCTest     from './ecc/ecc.test.js'
import schnorrTest from './ecc/sig.test.js'
import dlcTest     from './ecc/dlc.test.js'
import APICrawler  from './api/api.test.js'
import secretsTest from './ecc/sec.test.js'
import tweaktests  from './ecc/tweak.test.js'

tape('Crypto-Utils Test Suite', async t => {

  t.test('Cipher Tests', t => {
    CipherTest(t)
  })

  t.test('Signer Tests', t => {
    SignerTest(t)
  })

  t.test('ECC Tests', t => {
    ECCTest(t)
    schnorrTest(t)
    dlcTest(t)
    secretsTest(t)
  })

  t.test('Tweak tests', t => {
    tweaktests(t)
  })
  
  t.test('API Crawler Tests', async t => {
    await APICrawler(t)
  })
})
