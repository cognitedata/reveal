import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import images from '@rollup/plugin-image';
// import sourcemaps from 'rollup-plugin-sourcemaps';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      // sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      // sourcemap: true,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    '@cognite/cogs.js/dist/cogs.css',
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    // sourcemaps(),
    images({ incude: ['**/*.svg', '**/*.jpg'] }),
    json(),
  ],
};
