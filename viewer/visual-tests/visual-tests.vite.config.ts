/*!
 * Copyright 2021 Cognite AS
 */

import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import wasm from 'vite-plugin-wasm';
import fs from 'fs';
import path from 'path';

function setTestFixture(testFixture: string | undefined): string | boolean {
  if (testFixture === undefined) {
    return false;
  }
  const parsedTestFixturePath = path.parse(testFixture);
  if (parsedTestFixturePath === undefined) {
    throw new Error('Unknown test fixture argument');
  }
  return '/?testfixture=' + parsedTestFixturePath.name;
}

function readCdfEnv(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, './.cdf-env.json')).toString();
  } catch (_) {
    const yellowColor = '\x1b[33m';
    console.warn(yellowColor, '\nWARNING: CDF environments are not set which only allows local models to be loaded\n');
    return 'undefined';
  }
}

export default defineConfig(({ command }) => {
  const open = setTestFixture(process.env.testFixture);
  const cdfEnv = readCdfEnv();

  return {
    root: __dirname,

    plugins: [glsl()],

    define: {
      CDF_ENV: cdfEnv
    },

    css: {
      modules: {
        scopeBehaviour: 'global' // Disables hashing/renaming globally
      }
    },

    server: {
      allowedHosts: true,
      port: 8080,
      open
    },

    build: {
      assetsInlineLimit: Infinity,
      outDir: path.resolve(__dirname, 'dist'),
      sourcemap: command === 'serve' ? 'inline' : false
    },

    worker: {
      format: 'es',
      plugins: () => [wasm()]
    }
  };
});
