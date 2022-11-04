import tape from 'tape'
import camelcase from 'camelcase'
import pkg from '../package.json' assert { type: 'json' }

const DEFAULT_LIB = 'src/index.js'
const EXT = 'test.js'

const libName = camelcase(String('/' + pkg.name).split('/').at(-1))

tape(`Running tests for ${libName}`, async t => {
  
  const mainLib = await getLibrary()

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

async function getLibrary() {
  if (typeof window !== 'undefined') {
    return window[libName]
  }

  const libpath = (process?.argv)
    ? process.argv.slice(2,3)
    : DEFAULT_LIB

  if (String(libpath).includes('main')) {
    throw new Error('Unable to run tests on a commonJs module!')
  }

  console.log(`Testing package: ${libpath}`)

  return import('../' + libpath).then(m => m.default)
}
