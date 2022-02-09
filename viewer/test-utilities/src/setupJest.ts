/*!
 * Copyright 2021 Cognite AS
 */

// fetch() polyfill
import 'whatwg-fetch';
import { TextDecoder } from 'util';

// Create document.currentScript required by potree-core
Object.defineProperty(document, 'currentScript', {
  value: document.createElement('script')
});
(document.currentScript as any).src = 'http://localhost/iamdummy.html';

// To avoid warnings from CogniteClient that checks whether we use SSL
global.window = Object.create(window);
const url = 'https://api.cognitedata.com';
Object.defineProperty(window, 'location', {
  value: {
    href: url,
    protocol: 'https:'
  }
});

window.URL.createObjectURL = jest.fn();

// Mock Worker for web workers
class StubWorker {
  constructor(_: string) {}
  public postMessage(_: any) {}
}
(window as any).Worker = StubWorker;

// Filter away warning from ThreeJS about "THREE.WebGLRenderer: EXT_xxx extension not supported."
// which is caused by using a mock WebGL implementation for unit testing
const consoleWarn = console.warn.bind(console);
(console as any).warn = (message?: any, ...optionalParams: any[]) => {
  const messageStr = message + '';
  if (!messageStr.match(/THREE\.WebGLRenderer: .* extension not supported\./)) {
    consoleWarn(message, ...optionalParams);
  }
};

// Filter error generated from Unit test refering to WebGL1 shaders in ThreeJS.
// "THREE.WebGLProgram: Shader Error XXXX - VALIDATE_STATUS false"
const consoleError = console.error.bind(console);
(console as any).error = (message?: any, ...optionalParams: any[]) => {
  const messageStr = message + '';
  if (!messageStr.match(/THREE\.WebGLProgram: Shader Error ([0-9]+) - VALIDATE_STATUS false/)) {
    consoleError(message, ...optionalParams);
  }
};

(window as any).TextDecoder = TextDecoder;

Object.assign(process.env, {
  VERSION: require('../../package.json').version,
  WORKER_VERSION: require('../../node_modules/@cognite/reveal-parser-worker/package.json').version
});
