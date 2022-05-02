import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
    },
  ],
  external: ['react', 'react-dom', 'react-query', 'styled-components'],
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfigOverride: {
        exclude: ['**/*.spec.ts'],
      },
    }),
  ],
};
