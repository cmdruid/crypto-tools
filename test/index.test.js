import tape from 'tape'
import APICrawler from './api.test.js'

tape('Testing API', async t => {
  await APICrawler(t)
})
