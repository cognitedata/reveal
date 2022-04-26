import '__mocks/mockCogniteSDK';
import { getMockDocumentEmptyFacets } from '__test-utils/fixtures/document';

import { formatAssetIdsFilter, getFilterQuery } from '../utils';

describe('related document util', () => {
  describe('formatAssetIdsFilter', () => {
    it('returns the empty list', () => {
      const results = formatAssetIdsFilter([], false);
      expect(results).toEqual([]);
    });

    it('should return formatted asset ids for documents filter (v2)', async () => {
      const ids = [1234];
      const result = formatAssetIdsFilter(ids, false);

      expect(result.length).toBe(1);
      const [{ filters }] = result;

      expect(filters!).toMatchObject({
        containsAny: {
          property: ['assetIds'],
          values: ids,
        },
      });
    });

    it('should return formatted asset ids for document filter (v3)', async () => {
      const ids = ['1234'];
      const result = formatAssetIdsFilter(ids, true);

      expect(result.length).toBe(1);
      const [{ filters }] = result;

      // TODO(PP-2452): fix types
      expect(filters).toMatchObject({
        containsAny: {
          property: ['assetExternalIds'],
          values: ids,
        },
      });
    });

    it('batches/chunks the filters in two arrays', () => {
      const ids = [1, 2, 3, 4, 5];
      const result = formatAssetIdsFilter(ids, false, 4);

      expect(result.length).toBe(2);
      const [batch1, batch2] = result;

      expect(batch1.filters).toMatchObject({
        containsAny: {
          property: ['assetIds'],
          values: [1, 2, 3, 4],
        },
      });
      expect(batch2.filters).toMatchObject({
        containsAny: {
          property: ['assetIds'],
          values: [5],
        },
      });
    });
  });

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
