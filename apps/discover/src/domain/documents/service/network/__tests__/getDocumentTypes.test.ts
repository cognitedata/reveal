// disable reason: import order - should be first
// eslint-disable-next-line
import * as MockContainer from '__mocks/mockContainerAuth';

import head from 'lodash/head';
import { setupServer } from 'msw/node';

import { getAuthHeaders } from '@cognite/react-container';

import { getMockDocumentCategories } from '__test-utils/fixtures/documentCategories';

import { getMockDocumentCategoriesResult } from '../../__mocks/getMockDocumentCategoriesGet';
import { getDocumentTypes } from '../getDocumentTypes';

describe('Type Errors', () => {
  const mockServer = setupServer(getMockDocumentCategoriesResult());

  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('should return error as expected in document types', async () => {
    const result = await getDocumentTypes(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual([]);
  });
});

describe('Document types return', () => {
  const mockServer = setupServer(
    getMockDocumentCategoriesResult({ success: 'true' })
  );

  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('should return expected document type name', async () => {
    const result = await getDocumentTypes(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );

    expect(result).toEqual([
      head(getMockDocumentCategories().documentType)?.name,
    ]);
  });
});
