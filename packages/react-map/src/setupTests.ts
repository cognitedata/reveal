// import noop from 'lodash/noop';
import { jestPreviewConfigure } from 'jest-preview';
import '@testing-library/jest-dom';
import './mocks';

if (window.URL?.createObjectURL === undefined) {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}

jestPreviewConfigure({ autoPreview: true });

// jest.mock('html2canvas', () => {
//   return () =>
//     Promise.resolve({
//       toDataURL() {
//         return '';
//       },
//     });
// });

// HTMLCanvasElement.prototype.getContext = jest.fn();
