// disable reason: import order - should be first
// eslint-disable-next-line
import * as MockContainer from '__mocks/mockContainerAuth';

import { setupServer } from 'msw/node';

import { getAuthHeaders } from '@cognite/react-container';

import { getMockDocumentCategories } from '__test-utils/fixtures/documentCategories';

import { getMockDocumentCategoriesResult } from '../../__mocks/getMockDocumentCategoriesGet';
import { getCategories, documentError } from '../getCategories';

describe('Document Category and Type Errors', () => {
  const mockServer = setupServer(getMockDocumentCategoriesResult());

  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('should return error as expected in document category', async () => {
    const result = await getCategories(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual(documentError);
  });
});

describe('Categories return', () => {
  const mockServer = setupServer(
    getMockDocumentCategoriesResult({ success: 'true' })
  );

  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('should return expecting result', async () => {
    const result = await getCategories(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual(getMockDocumentCategories());
  });
});
