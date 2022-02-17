import { setupServer } from 'msw/node';

import { getMockDocumentEmptyFacets } from '__test-utils/fixtures/document';
import { getMockDocumentSearch } from 'modules/documentSearch/__mocks/getMockDocumentSearch';

import { documentSearchService } from '../service';

const mockServer = setupServer(getMockDocumentSearch());

describe('Document Search service', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  describe('getCategoriesByQuery', () => {
    it('should be ok', async () => {
      const result = await documentSearchService.getCategoriesByQuery(
        {
          phrase: 'test',
          facets: getMockDocumentEmptyFacets(),
          geoFilter: [],
        },
        {},
        'lastcreated'
      );

      expect(result).toEqual({
        facets: [
          {
            count: 500,
            key: '2020',
            name: '2020',
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
      expect(result.aggregates?.length).toEqual(6);
    });
  });
});
