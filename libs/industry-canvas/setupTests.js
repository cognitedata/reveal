import '@testing-library/jest-dom';
// eslint-disable-next-line lodash/prefer-noop
window.URL.createObjectURL = function () {
  return undefined;
};

jest.mock('@cognite/unified-file-viewer', () => ({
  ToolType: {
    RECTANGLE: 'rectangle',
    SELECT: 'select',
    ELLIPSE: 'ellipse',
    POLYLINE: 'polyline',
    LINE: 'line',
    TEXT: 'text',
    IMAGE: 'image',
    PAN: 'pan',
  },
  ContainerType: {
    EVENT: 'event',
    DOCUMENT: 'document',
  },
  AnnotationType: {
    STICKY: 'sticky',
  },
}));
