import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import images from '@rollup/plugin-image';

import pkg from './package.json';

export default [
  {
    input: 'src/index.tsx',
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
      'lodash/isEqual',
      'lodash/isString',
      'lodash/isObject',
      'lodash/isArray',
      'lodash/clone',
      'lodash/cloneDeep',
      'lodash/isNil',
      'lodash/startCase',
      'lodash/isNumber',
      'prop-types',
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      images({
        incude: [
          '**/*.svg',
          '**/*.jpg',
          '**/*.png',
          'src/assets/*.svg',
          'src/assets/*.jpg',
          'src/assets/*.png',
          'assets/*.svg',
          'assets/*.jpg',
          'assets/*.png',
        ],
      }),
      json(),
    ],
  },
];
