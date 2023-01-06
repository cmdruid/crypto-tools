// rollup.config.ts
import typescript  from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs    from '@rollup/plugin-commonjs'
import { terser }  from 'rollup-plugin-terser'

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
}

const onwarn = warning => {
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	// eslint-disable-next-line unicorn/error-message
	throw Object.assign(new Error(), warning);
}

const tsConfig = { 
  compilerOptions: {
    declaration: false,
    declarationDir: null,
    declarationMap: false
  }
}

const nodeConfig = {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/main.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/module.js',
      format: 'es',
      sourcemap: true,
      minifyInternalExports: false
    },
  ],
  plugins: [ typescript(tsConfig), nodeResolve(), commonjs() ],
  strictDeprecations: true,
  treeshake
}

const browserConfig = {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/bundle.min.js',
      format: 'iife',
      name: 'cryptoUtils',
      plugins: [terser()],
      sourcemap: true,
      globals: {
        crypto: 'crypto',
      }
    },
  ],
  plugins: [ 
    typescript(tsConfig), 
    nodeResolve({ browser: true, preferBuiltins: false }), 
    commonjs() 
  ],
  strictDeprecations: true,
  treeshake
}

// const testConfig = {
//   input: 'test/index.test.js',
//   onwarn,
//   output: [
//     {
//       file: 'test/browser.test.js',
//       format: 'iife',
//       name: 'test',
//       sourcemap: false,
//       globals: {
//         tape: 'tape'
//       }
//     }
//   ],
//   external: ['tape'],
//   plugins: [
//     typescript({ ...tsConfig, sourceMap: false }), 
//     nodeResolve(), 
//     commonjs()
//   ],
//   strictDeprecations: true,
//   treeshake
// }

export default [ nodeConfig, browserConfig ];