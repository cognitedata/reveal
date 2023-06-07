import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { mockCogniteClient } from './__mocks';

jest.mock('@cognite/unified-file-viewer', () => ({}));

jest.mock('@cognite/sdk-provider', () => {
  return {
    useSDK: () => mockCogniteClient,
  };
});
