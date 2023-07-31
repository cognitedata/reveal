// disable reason: import order - should be first
// eslint-disable-next-line
import * as MockContainer from '__mocks/mockContainerAuth';

import { setupServer } from 'msw/node';

import { getAuthHeaders } from '@cognite/react-container';

import { getMockDocumentCategories } from '__test-utils/fixtures/documentCategories';

import { getMockDocumentCategoriesResult } from '../../__mocks/getMockDocumentCategoriesGet';
import { getCategories, documentError } from '../getCategories';

const mockServer = setupServer();
describe('getCategories', () => {
  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('should return error as expected in document category', async () => {
    mockServer.use(getMockDocumentCategoriesResult());
    const result = await getCategories(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual(documentError);
  });

  it('should return expecting result', async () => {
    mockServer.use(getMockDocumentCategoriesResult({ success: 'true' }));
    const result = await getCategories(
      getAuthHeaders(),
      MockContainer.TEST_PROJECT
    );
    expect(result).toEqual(getMockDocumentCategories());
  });
});
