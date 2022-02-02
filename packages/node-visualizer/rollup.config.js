import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import images from '@rollup/plugin-image';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    // https://github.com/facebook/react/issues/20235
    // with react 17 we are getting Unresolved dependencies for react/jsx-runtime
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
    alias({
      entries: {
        images: `${__dirname}/src/images`,
      },
    }),
    resolve(),
    typescript({
      typescript: require('typescript'),
    }),
    images({
      incude: [
        '**/*.svg',
        '**/*.jpg',
        '**/*.png',
        'images/**/*.png',
        'images/Nodes/*.png',
      ],
    }),
    json(),
  ],
};
