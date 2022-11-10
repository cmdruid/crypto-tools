import tape from 'tape'
import ECCTest    from './ecc/ecc.test.js'
import APICrawler from './api/api.test.js'

tape('Crypto-Utils Test Suite', async t => {

  t.test('ECC Tests', t => {
    ECCTest(t)
  })
  
  t.test('API Crawler Tests', async t => {
    await APICrawler(t)
  })
})
