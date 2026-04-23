/*!
 * Copyright 2021 Cognite AS
 */

// fetch() polyfill
import 'whatwg-fetch';
import { jest } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'util';
import ResizeObserver from 'resize-observer-polyfill';

// To avoid warnings from CogniteClient that checks whether we use SSL
const url = 'https://api.cognitedata.com';
Object.defineProperty(window, 'location', {
  value: {
    href: url,
    origin: url,
    protocol: 'https:'
  }
});

window.URL.createObjectURL = jest.fn<() => string>();

// Mock Worker for web workers
class StubWorker {
  constructor(_: string) {}
  public postMessage(_: any) {}
}
(window as any).Worker = StubWorker;
(window as any).ResizeObserver = ResizeObserver;

(window as any).TextDecoder = TextDecoder;
(window as any).TextEncoder = TextEncoder;

// jsdom does not implement PointerEvent; polyfill so instanceof checks work in tests.
class PointerEventPolyfill extends MouseEvent {
  readonly pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? '';
  }
}
(window as any).PointerEvent = PointerEventPolyfill;

import packageObject from '../../package.json' with { type: 'json' };

Object.assign(process.env, {
  VERSION: packageObject.version
});
