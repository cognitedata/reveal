"""Easy shortcuts for apps dependencies """

STORYBOOK_DEPENDENCIES = [
    "@npm//@storybook/addon-essentials",
    "@npm//@storybook/addon-links",
    "@npm//@storybook/addon-interactions",
    "@npm//chromatic",
    "@npm//storybook-addon-designs",
    "@npm//msw-storybook-addon",
    "@npm//@storybook/react",
    "@npm//@storybook/jest",
    "@npm//@storybook/testing-library",
    "@npm//@storybook/builder-vite",
    "@npm//vite-plugin-babel-macros",
    "@npm//vite-tsconfig-paths",
    "@npm//vite-plugin-turbosnap",
]

VITE_DEPENDENCIES = [
    "@npm//@esbuild-plugins/node-globals-polyfill",
    "@npm//@esbuild-plugins/node-modules-polyfill",
    "@npm//@vitejs/plugin-basic-ssl",
    "@npm//path-browserify",
    "@npm//stream-browserify",
    "@npm//rollup-plugin-node-polyfills",
    "@npm//@babel/preset-react",
    "@npm//@vitejs/plugin-react",
    "@npm//vite-tsconfig-paths",
    "@npm//vite-plugin-svgr",
    "@npm//vite-plugin-babel-macros",
    "@npm//rollup-plugin-node-builtins",
]
