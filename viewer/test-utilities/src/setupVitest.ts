/*!
 * Copyright 2021 Cognite AS
 */

// fetch() polyfill
import 'whatwg-fetch';
import { vi } from 'vitest';
import { TextDecoder, TextEncoder } from 'node:util';
import packageObject from '../../package.json' with { type: 'json' };

// Make jest available globally for jest-canvas-mock compatibility
(globalThis as any).jest = vi;

// window.location is pre-configured to HTTPS via vitest.config.ts environmentOptions.jsdom.url

window.URL.createObjectURL = vi.fn<() => string>();

// Mock Worker for web workers
class StubWorker {
  constructor(_: string) {}
  public postMessage(_: any) {}
}
(window as any).Worker = StubWorker;

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

Object.assign(process.env, {
  VERSION: packageObject.version
});
