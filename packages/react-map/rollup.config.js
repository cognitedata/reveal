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
      // https://github.com/facebook/react/issues/20235
      // with react 17 we are getting Unresolved dependencies for react/jsx-runtime
      'react/jsx-runtime',
      'lodash/isUndefined',
      'lodash/noop',
      'lodash/isFunction',
      'lodash/isObject',
      'lodash/findLast',
      'lodash/isEqual',
      'lodash/isArray',
      'lodash/isEmpty',
      'maplibre-gl/dist/maplibre-gl.css',
      '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css',
      '@cognite/cogs.js/dist/cogs.css',
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      json(),
    ],
  },
  {
    input: 'src/mocks.ts',
    output: [
      {
        file: 'dist/mocks.js',
        format: 'cjs',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      // https://github.com/facebook/react/issues/20235
      // with react 17 we are getting Unresolved dependencies for react/jsx-runtime
      'react/jsx-runtime',
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      json(),
    ],
  },
];
