import { jestPreviewConfigure } from 'jest-preview';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { setStyleSheetSerializerOptions } from 'jest-styled-components/serializer';

if (window.URL?.createObjectURL === undefined) {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}

jestPreviewConfigure({ autoPreview: true });

HTMLCanvasElement.prototype.getContext = jest.fn();

const intersectionObserverMock = () => ({
  observe: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = jest
  .fn()
  .mockImplementation(intersectionObserverMock);

setStyleSheetSerializerOptions({
  addStyles: false,
  classNameFormatter: (index: number) => `styled${index}`,
});
