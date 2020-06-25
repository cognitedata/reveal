/*!
 * Copyright 2020 Cognite AS
 */

// fetch() polyfill
import 'whatwg-fetch';

// Create document.currentScript required by potree-core
Object.defineProperty(document, 'currentScript', {
  value: document.createElement('script')
});
(document.currentScript as any).src = 'http://localhost/iamdummy.html';

// Mock Worker for web workers
class StubWorker {
  constructor(_: string) {}
  public postMessage(_: any) {}
}
(window as any).Worker = StubWorker;

// Filter away warning from ThreeJS about "THREE.WebGLRenderer: EXT_xxx extension not supported."
// which is caused by using a mock WebGL implementation for unit testing
// tslint:disable-next-line: no-console
const consoleWarn = console.warn.bind(console);
(console as any).warn = (message?: any, ...optionalParams: any[]) => {
  const messageStr = message + '';
  if (!messageStr.match(/THREE\.WebGLRenderer: .* extension not supported\./)) {
    consoleWarn(message, ...optionalParams);
  }
};
