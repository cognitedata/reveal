/*!
 * Copyright 2021 Cognite AS
 */

import 'vitest-canvas-mock';
import { vi } from 'vitest';
import { TextDecoder, TextEncoder } from 'node:util';

window.URL.createObjectURL = vi.fn<() => string>();

// Mock Worker for web workers
class StubWorker {
  constructor(_: string) {}
  public postMessage(_: any) {}
}
(window as any).Worker = StubWorker;

afterEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

vi.stubGlobal(
  'ResizeObserver',
  class {
    callback: any;
    constructor(callback: any) {
      this.callback = callback;
    }
    observe(target: any) {
      if (!target || !(target instanceof Element)) {
        console.warn('ResizeObserver.observe was called with an invalid target, skipping.', target);
        return;
      }
    }
    unobserve() {}
    disconnect() {}
  }
);

global.TextDecoder = TextDecoder as typeof global.TextDecoder;
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
(window as any).TextDecoder = TextDecoder;
(window as any).TextEncoder = TextEncoder;
