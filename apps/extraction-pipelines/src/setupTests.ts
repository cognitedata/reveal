// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import './utils/test/matchMedia';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import './cognite-cdf-route-tracker.d.ts';

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    sdkv3: jest.fn(),
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

sdkv3.get = jest.fn();
sdkv3.post = jest.fn();
// @ts-ignore
sdkv3.datasets = {
  retrieve: jest.fn(),
  list: jest.fn(),
};
// @ts-ignore
sdkv3.raw = {
  listDatabases: jest.fn(),
  listTables: jest.fn(),
};
