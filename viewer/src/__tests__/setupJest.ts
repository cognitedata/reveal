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
