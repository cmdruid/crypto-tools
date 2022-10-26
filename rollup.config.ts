// rollup.config.ts
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import type { RollupOptions, WarningHandlerWithDefault } from 'rollup'

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
}

const compilerOptions = {
  declaration: true,
  declarationDir: 'types',
  declarationMap: true,
  emitDeclarationOnly: true,
  sourceMap: true,
  outDir: 'types',
}

const onwarn: WarningHandlerWithDefault = warning => {
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	// eslint-disable-next-line unicorn/error-message
	throw Object.assign(new Error(), warning);
}

const nodeConfig : RollupOptions = {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/main.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/module.js',
      format: 'es',
      sourcemap: true,
      minifyInternalExports: false
    },
  ],
  plugins: [json(), typescript(compilerOptions), nodeResolve(), commonjs()],
  strictDeprecations: true,
  treeshake
}

const browserConfig : RollupOptions = {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/bundle.min.js',
      format: 'iife',
      sourcemap: true,
      name: 'cryptoUtils',
      plugins: [terser()],
      globals: {
        crypto: 'crypto',
      }
    },
  ],
  plugins: [json(), typescript(compilerOptions), nodeResolve({ browser: true }), commonjs()],
  strictDeprecations: true,
  treeshake
}

const testConfig : RollupOptions = {
  input: 'test/index.test.js',
  onwarn,
  output: [
    {
      file: 'test/browser.test.js',
      format: 'iife',
      name: 'test',
      plugins: [terser()],
      globals: {
        tape: 'tape'
      }
    }
  ],
  external: ['crypto', 'tape'],
  plugins: [
    json(), 
    typescript({ compilerOptions: { noEmit: true }}), 
    nodeResolve({ browser: true }), 
    commonjs()
  ],
  strictDeprecations: true,
  treeshake
}

export default [ nodeConfig, browserConfig, testConfig ];