import tape      from 'tape'
import benchTest from './src/bench.test.js'

tape('crypto-utils bench test', async t => {
  benchTest(t)
})
