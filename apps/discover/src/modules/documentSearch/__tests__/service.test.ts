import '__mocks/mockCogniteSDK'; // should be first

import { getMockDocumentSearch } from 'domain/documents/service/__mocks/getMockDocumentSearch';

import { setupServer } from 'msw/node';

import { getMockDocumentEmptyFacets } from '__test-utils/fixtures/document';

import { documentSearchService } from '../service';

const mockServer = setupServer(getMockDocumentSearch());

describe('Document Search service', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  describe('getCategoriesByQuery', () => {
    it('should be ok', async () => {
      const result = await documentSearchService.getCategoriesByQuery({
        query: {
          phrase: 'test',
          facets: getMockDocumentEmptyFacets(),
          geoFilter: [],
        },
        filters: undefined,
        category: 'location',
      });

      expect(result).toEqual({
        facets: [
          {
            count: 300,
            key: 'sourceFile.source',
            name: 'TestSource',
            selected: false,
          },
        ],
        total: 100,
      });
    });
  });

  describe('documentsByIds', () => {
    it('should be ok', async () => {
      const result = await documentSearchService.documentsByIds([1, 2]);

      expect(result.items.length).toEqual(1);
      expect(result.aggregates?.length).toEqual(5);
    });
  });
});
