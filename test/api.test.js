import { Type } from '@cmdcode/bytes-utils'
import camelcase from 'camelcase'
import pkg from '../package.json' assert { type: 'json' }

const SOURCE_PATH = './src'
const DEFAULT_EXT = 'test.js'
const DEFAULT_LIB = 'src/index.js'

let testCache

export default async function (t) {
  testCache = t
  const libName = camelcase(String('/' + pkg.name).split('/').at(-1))
  const mainLib = await getLibrary(libName)
  crawlAPI(mainLib)
}

async function getLibrary(libName) {
  if (typeof window !== 'undefined') {
    return window[libName]
  }

  const libpath = (process?.argv && process.argv.length > 2)
    ? process.argv.slice(2,3)
    : DEFAULT_LIB

  if (String(libpath).includes('main')) {
    throw new Error('Unable to run tests on a commonJs module!')
  }

  console.log(`Testing package: ${libpath}`)

  return import('../' + libpath).then(m => {
    return (m.default)
      ? m.default
      : m
  })
}

function crawlAPI(lib, paths = []) {
  for (const [key, val] of Object.entries(lib)) {
    // console.log(`Crawling ${key}: ${Type.of(val)}`)
    if (Type.is.class(val)) {
      const newpath = [...paths, key]
      testInstance(val, newpath)
      crawlAPI(val, newpath)
      console.log('Registering tests for class:', key)
    }

    else if (Type.is.function(val)) {
      testLoader(key, val, paths)
    }

    else if (Type.is.object(val)) {
      const newpath = [...paths, key]
      crawlAPI(val, newpath)
    }

    else {
      console.log(paths, val)
    }
  }
}

function testInstance(val, paths) {
  const newpath = [...paths, 'new']
  for (const prop of Object.getOwnPropertyNames(val.prototype)) {
    testLoader(prop, val, newpath)
  }
}

function testLoader(key, val, paths) {
  const relpath  = paths.join('/').toLowerCase()
  const fullpath = `${SOURCE_PATH}/${relpath}/${key}.${DEFAULT_EXT}`
  //console.log(`Testing: ${fullpath}`)
  import(fullpath)
    .then(test => testRunner(test.default, val, fullpath))
    .catch(err => err) //console.log(`Failed to import test for: ${fullpath}`))
}

function testRunner(test, lib, path) {
  testCache.test(`Testing: ${path}`, t => {
    test(t, lib)
  })
}
