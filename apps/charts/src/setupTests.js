/* eslint no-console: 0 */
import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime';
import noop from 'lodash/noop';

window.URL.createObjectURL = noop;

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  getBaseUrl: () => '123',
}));
