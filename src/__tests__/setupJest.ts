/*!
 * Copyright 2019 Cognite AS
 */

// Mock for fetch() (exposed using fetchMock())
import { GlobalWithFetchMock } from 'jest-fetch-mock';
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
