// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import * as mocks from '@cognite/metrics/dist/mocks';
import isUndefined from 'lodash/isUndefined';
import 'jest-canvas-mock';

jest.mock('@cognite/metrics', () => mocks);

if (isUndefined(window.URL.createObjectURL)) {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}
