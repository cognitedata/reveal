import '__mocks/mockContainerAuth'; // never miss this import
import 'services/documents/__mocks/setupDocumentsMockSDK';
import { setupServer } from 'msw/node';

import { getDocumentFixture } from '__test-utils/fixtures/documents/getDocumentFixture';
import { getMockDocumentSearch } from 'modules/documentSearch/__mocks/getMockDocumentSearch';

import { getDocumentSearchById } from '../getDocumentSearchById';

describe('Document search undefined', () => {
  const mockServer = setupServer(getMockDocumentSearch({ items: [] }));
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should be undefined', async () => {
    const result = await getDocumentSearchById(1);

    expect(result).toBeUndefined();
  });
});

describe('Document search', () => {
  const mockServer = setupServer(getMockDocumentSearch());
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected value', async () => {
    const result = await getDocumentSearchById(1);

    expect(result?.doc.filename).toEqual(getDocumentFixture().sourceFile.name);
  });
});
