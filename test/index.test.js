import tape from 'tape'
import pkg from './package.json' assert { type: 'json' }

const LIB_NAME = 'cryptoUtils'

tape(`Running tests for ${LIB_NAME}`, async t => {
  const EXT = 'test.js'
  const mainLib = await getLibrary(LIB_NAME)

  for (const key of Object.keys(mainLib)) {
    try {
      const tests = await import(`./src/${key}.${EXT}`)
      for (const testName of Object.keys(tests)) {
        const testedLib = mainLib[key][testName]
        if (typeof testedLib === 'function') {
          t.test(`Performing tests for ${key}.${testName}:`, t => {
            tests[testName](t, testedLib)
          })
        }
      }
    } catch (err) {
      console.log(`Failed to load tests for ${key}. Skipping ...`)
    }
  }
})

async function getLibrary(libname) {
  const DEFAULT_LIB = 'src/index.js'

  if (typeof window !== 'undefined') {
    return window[LIB_NAME]
  }

  const libpath = (process?.args)
    ? process.args.slice(2,3)
    : DEFAULT_LIB
  
  return (libpath.includes('main'))
  ? require('../' + libpath)
  : import('../' + libpath).then(m => m.default)
}
