import '__mocks/mockCogniteSDK';
import { getMockDocumentEmptyFacets } from '__test-utils/fixtures/document';

import { getFilterQuery } from '../useRelatedDocumentFilterQuery';

describe('related document util', () => {
  describe('getFilterQuery', () => {
    it('should return filter query', async () => {
      const query = getFilterQuery({
        filters: {
          documents: {
            facets: {
              ...getMockDocumentEmptyFacets(),
              fileCategory: ['Test File Type 1'],
            },
          },
        },
      });

      expect(query).toEqual({
        facets: {
          ...getMockDocumentEmptyFacets(),
          fileCategory: ['Test File Type 1'],
        },
        geoFilter: [],
        phrase: '',
      });
    });

    it('should return empty filter query', async () => {
      const query = getFilterQuery();

      expect(query).toEqual({
        facets: getMockDocumentEmptyFacets(),
        geoFilter: [],
        phrase: '',
      });
    });
  });
});
