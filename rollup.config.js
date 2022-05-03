import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
    },
  ],
  external: [
    '@cognite/cdf-utilities',
    '@cognite/react-feature-flags',
    'i18next',
    'i18next-locize-backend',
    'locize',
    'react',
    'react-dom',
    'react-i18next',
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfigOverride: {
        exclude: ['**/*.spec.ts'],
      },
    }),
  ],
};
