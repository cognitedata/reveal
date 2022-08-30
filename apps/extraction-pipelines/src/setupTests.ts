// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import './utils/test/matchMedia';
import noop from 'lodash/noop';
import './cdf-route-tracker.d.ts';
import 'babel-polyfill';

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    datasets: {
      retrieve: jest.fn(),
      list: jest.fn(),
    },
    raw: {
      listDatabases: jest.fn(),
      listTables: jest.fn(),
    },
    getFlow: () => ({ flow: 'flow' }),
  };
});
jest.mock('@cognite/sdk-provider', () => {
  return {
    useSDK: jest.fn(),
  };
});
jest.mock('utils/Metrics', () => {
  return {
    trackUsage: jest.fn(),
  };
});
jest.mock('@cognite/sdk-react-query-hooks', () => {
  return {
    useCapabilities: jest.fn(),
  };
});

window.URL.createObjectURL = noop as any;
