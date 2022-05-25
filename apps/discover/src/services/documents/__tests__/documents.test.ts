// disable reason: import order - should be first
// eslint-disable-next-line
import * as MockContainer from '__mocks/mockContainerAuth';

import head from 'lodash/head';
import { setupServer } from 'msw/node';

import { getAuthHeaders } from '@cognite/react-container';

import { getMockDocumentCategories } from '__test-utils/fixtures/documentCategories';

import { getMockDocumentCategoriesResult } from '../__mocks/getMockDocumentCategoriesGet';
import { documentError, documents } from '../documents';

describe('Document Category and Type Errors', () => {
  const mockServer = setupServer(getMockDocumentCategoriesResult());

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return error as expected in document category', async () => {
    const result = await documents.category(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual(documentError);
  });

  it('should return error as expected in document types', async () => {
    const result = await documents.documentTypes(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual([]);
  });
});

describe('Document Types and Categories', () => {
  const mockServer = setupServer(
    getMockDocumentCategoriesResult({ success: 'true' })
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expecting result', async () => {
    const result = await documents.category(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual(getMockDocumentCategories());
  });

  it('should return expected document type name', async () => {
    const result = await documents.documentTypes(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );

    expect(result).toEqual([
      head(getMockDocumentCategories().documentType)?.name,
    ]);
  });
});
