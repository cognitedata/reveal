import strip from '@rollup/plugin-strip';
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'source/Main.ts',
	plugins: [
		typescript(),
		strip({
			functions: ['assert.*', 'debug', 'alert']
		})
	],
	output: [
		{
			format: 'es',
			file: 'build/geo-three.module.js',
			indent: '\t',
			sourcemap: true
		},
		{
			globals: {three: 'THREE'},
			format: 'umd',
			name: 'Geo',
			file: 'build/geo-three.js',
			indent: '\t',
			sourcemap: true
		}
	]
};
