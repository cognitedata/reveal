// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import './utils/test/matchMedia';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    sdkv3: jest.fn(),
  };
});

sdkv3.get = jest.fn();
