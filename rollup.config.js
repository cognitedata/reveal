/* eslint-disable global-require */
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import { terser } from 'rollup-plugin-terser';
// import multi from '@rollup/plugin-multi-entry';
import commonjs from '@rollup/plugin-commonjs';

import path from 'path';
import pkg from './package.json';

const projectRootDir = path.resolve(__dirname);

export default [
  {
    input: 'src/index.tsx',
    output: [
      {
        file: pkg.main,
        name: 'named',
        format: 'umd',
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      terser(),
      // multi({ entryFileName: '[name].js' }),
      typescript({
        typescript: require('typescript'),
        exclude: ['tests/*', '**/*.(spec|test|stories).ts+(|x)'],
        tsconfig: './tsconfig.json',
      }),
      commonjs(),
      alias({
        entries: [
          {
            find: 'src',
            replacement: path.resolve(projectRootDir, 'src'),
          },
        ],
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.ts', '.tsx'],
        babelHelpers: 'runtime',
      }),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  },
];
