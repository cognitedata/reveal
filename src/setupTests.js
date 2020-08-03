/* eslint no-console: 0 */
/* eslint jest/require-top-level-describe: 0 */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'regenerator-runtime/runtime';

configure({ adapter: new Adapter() });

jest.mock('utils/Metrics');

let consoleWrittenTo;

let originalLog;
let originalWarn;
let originalError;

beforeEach(() => {
  consoleWrittenTo = false;
  originalLog = global.console.log;
  originalWarn = global.console.warn;
  originalError = global.console.error;

  jest.spyOn(global.console, 'log').mockImplementation((...args) => {
    consoleWrittenTo = true;
    originalLog(...args);
  });
  jest.spyOn(global.console, 'warn').mockImplementation((...args) => {
    consoleWrittenTo = true;
    originalWarn(...args);
  });
  jest.spyOn(global.console, 'error').mockImplementation((...args) => {
    consoleWrittenTo = true;
    originalError(...args);
  });
});

afterEach(() => {
  if (consoleWrittenTo) {
    throw new Error(
      'Console log, warnings and errors are not allowed when running tests. Mock them if you really need it.'
    );
  }

  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});
