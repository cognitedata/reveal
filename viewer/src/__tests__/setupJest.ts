/*!
 * Copyright 2020 Cognite AS
 */

// Mock for fetch() (exposed using fetchMock())
import { GlobalWithFetchMock } from 'jest-fetch-mock';
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

// Create document.currentScript required by potree-core
Object.defineProperty(document, 'currentScript', {
  value: document.createElement('script')
});
(document.currentScript as any).src = 'http://localhost/iamdummy.html';
