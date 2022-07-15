import { jestPreviewConfigure } from 'jest-preview';
import '@testing-library/jest-dom';

if (window.URL?.createObjectURL === undefined) {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}

jestPreviewConfigure({ autoPreview: true });
