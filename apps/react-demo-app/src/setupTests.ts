// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import * as mocks from '@cognite/metrics/dist/mocks';
import { jestPreviewConfigure } from 'jest-preview';

jest.mock('@cognite/metrics', () => mocks);
jestPreviewConfigure({ autoPreview: true });
