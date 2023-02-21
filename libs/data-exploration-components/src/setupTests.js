import '@testing-library/jest-dom';

jest.mock('@cognite/unified-file-viewer', () => ({
  isSupportedFileInfo: jest.fn(),
}));
