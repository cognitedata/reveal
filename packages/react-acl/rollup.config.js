import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      'react/jsx-runtime',
      'lodash/isFunction',
      'lodash/startCase',
      'lodash/without',
      'lodash/difference',
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      json(),
    ],
  },
];
