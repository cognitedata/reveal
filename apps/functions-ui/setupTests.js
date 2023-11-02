/* eslint no-console: 0 */
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'regenerator-runtime/runtime';
// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';

configure({ adapter: new Adapter() });

// jest.mock('utils/Metrics');

jest.mock('@cognite/cdf-utilities', () => {
  return {
    getProject: () => 'mockProject',
    createLink: jest.fn(),
  };
});

jest.mock('@cognite/sdk-provider', () => {
  return {
    useSDK: jest.fn(),
  };
});

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  getUserInformation: jest.fn().mockResolvedValue({ displayName: 'test-user' }),
  get: jest.fn(),
  post: jest.fn(),
  getFlow: () => ({ flow: 'AZURE_AD' }),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// let consoleWrittenTo;

// let originalLog;
// let originalWarn;
// let originalError;

// let newError;
// let newWarn;
// let newLog;

// beforeEach(() => {
//   consoleWrittenTo = false;
//   originalLog = global.console.log;
//   originalWarn = global.console.warn;
//   originalError = global.console.error;

//   newError = (_msg) => false;
//   newWarn = (_msg) => false;
//   newLog = (_msg) => false;

//   jest.spyOn(global.console, 'log').mockImplementation((...args) => {
//     //consoleWrittenTo = true;
//     newLog(...args);
//   });
//   jest.spyOn(global.console, 'warn').mockImplementation((...args) => {
//     //consoleWrittenTo = true;
//     newWarn(...args);
//   });
//   jest.spyOn(global.console, 'error').mockImplementation((...args) => {
//     //consoleWrittenTo = true;
//     newError(...args);
//   });
// });

// afterEach(() => {
//   if (consoleWrittenTo) {
//     throw new Error(
//       'Console log, warnings and errors are not allowed when running tests. Mock them if you really need it.'
//     );
//   }

//   console.log = originalLog;
//   console.warn = originalWarn;
//   console.error = originalError;
// });

global.console = { warn: jest.fn(), error: jest.fn() };
