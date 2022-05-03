import '__mocks/mockCogniteSDK'; // never miss this import

import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';

import { getDocumentFixture } from '__test-utils/fixtures/documents/getDocumentFixture';

import { searchDocumentById } from '../searchDocumentById';

describe('Document search undefined', () => {
  const mockServer = setupServer(getMockDocumentSearch({ items: [] }));
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should be undefined', async () => {
    const result = await searchDocumentById(1);

    expect(result).toBeUndefined();
  });
});

describe('Document search', () => {
  const mockServer = setupServer(getMockDocumentSearch());
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected value', async () => {
    const result = await searchDocumentById(1);

    expect(result?.doc.filename).toEqual(getDocumentFixture().sourceFile.name);
  });
});
