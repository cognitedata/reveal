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
