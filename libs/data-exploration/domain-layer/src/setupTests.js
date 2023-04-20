import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { mockCogniteClient } from '../src/__mocks/MockedCogniteClient';

jest.mock('@cognite/unified-file-viewer', () => ({}));

jest.mock('@cognite/sdk-provider', () => {
  return {
    useSDK: () => mockCogniteClient,
  };
});
