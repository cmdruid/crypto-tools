// rollup.config.ts
import typescript  from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs    from '@rollup/plugin-commonjs'
import terser      from '@rollup/plugin-terser'

const treeshake = {
	moduleSideEffects       : false,
	propertyReadSideEffects : false,
	tryCatchDeoptimization  : false
}

const onwarn = warning => { throw new Error(warning) }

const tsConfig = { 
  compilerOptions: {
    declaration    : false,
    declarationDir : null,
    declarationMap : false
  }
}

export default {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/main.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/module.mjs',
      format: 'es',
      sourcemap: true,
      minifyInternalExports: false
    },
    {
      file: 'dist/browser.js',
      format: 'iife',
      name: 'crypto_utils',
      plugins: [terser()],
      sourcemap: true,
      globals: {
        crypto  : 'crypto'
      }
    }
  ],
  plugins: [ typescript(tsConfig), nodeResolve(), commonjs() ],
  strictDeprecations: true,
  treeshake
}
