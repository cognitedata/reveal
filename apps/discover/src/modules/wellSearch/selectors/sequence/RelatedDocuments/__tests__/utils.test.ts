import {
  getMockDocument,
  getMockDocumentEmptyFacets,
  getMockDocumentFacets,
  getMockDocumentMetadata,
  getMockDocumentResultsEmptyFacets,
} from '__test-utils/fixtures/document';

import {
  filterBySelectedWellboreIds,
  formatAssetIdsFilter,
  getFilterQuery,
  getMergedFacets,
  getSelectedWellboreIds,
} from '../utils';

describe('related document util', () => {
  describe('getSelectedWellboreIds', () => {
    it('should return wellbore ids', async () => {
      const ids = getSelectedWellboreIds({ 1234: true, 5678: false });
      expect(ids).toEqual([1234]);
    });
  });

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

      expect(filters!.assetIds).toMatchObject({ containsAny: [1234] });
    });

    it('should return formatted asset ids for document filter (v3)', async () => {
      const ids = ['1234'];
      const result = formatAssetIdsFilter(ids, true);

      expect(result.length).toBe(1);
      const [{ filters }] = result;

      // TODO(PP-2452): fix types
      expect((filters as any).assetExternalIds).toMatchObject({
        containsAny: ['1234'],
      });
    });

    it('batches/chunks the filters in two arrays', () => {
      const ids = [1, 2, 3, 4, 5];
      const result = formatAssetIdsFilter(ids, false, 4);

      expect(result.length).toBe(2);
      const [batch1, batch2] = result;

      expect(batch1.filters!.assetIds).toMatchObject({
        containsAny: [1, 2, 3, 4],
      });
      expect(batch2.filters!.assetIds).toMatchObject({ containsAny: [5] });
    });
  });

  describe('filterBySelectedWellboreIds', () => {
    it('should return filtered wellbore ids', async () => {
      const documents = filterBySelectedWellboreIds(
        [1234],
        [
          getMockDocument({
            id: '1234',
            doc: {
              ...getMockDocumentMetadata({ id: '1234', assetIds: [1234] }),
            },
          }),
          getMockDocument({
            id: '5555',
            doc: {
              ...getMockDocumentMetadata({ id: '5555', assetIds: [5555] }),
            },
          }),
        ]
      );

      expect(documents.length).toEqual(1);
      expect(documents[0].id).toEqual('1234');
    });
  });

  describe('getFilterQuery', () => {
    it('should return filter query', async () => {
      const query = getFilterQuery({
        filters: {
          documents: {
            facets: {
              ...getMockDocumentEmptyFacets(),
              filetype: ['Test File Type 1'],
            },
          },
        },
      });

      expect(query).toEqual({
        facets: {
          ...getMockDocumentEmptyFacets(),
          filetype: ['Test File Type 1'],
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

  describe('getMergedFacets', () => {
    it('should return merged facets', async () => {
      const dynamicFacets = {
        ...getMockDocumentResultsEmptyFacets({
          filetype: [
            {
              count: 100,
              key: 'PDF',
              name: 'PDF',
              selected: false,
            },
          ],
        }),
      };

      const query = getMergedFacets(
        getMockDocumentFacets(),
        dynamicFacets,
        getMockDocumentEmptyFacets({
          filetype: ['PDF'],
        })
      );

      expect(query).toEqual({
        filetype: [
          {
            count: 100,
            key: 'PDF',
            name: 'PDF',
            selected: true,
          },
        ],
        labels: [
          {
            count: 0,
            key: 'TestId',
            name: 'TestId',
            selected: false,
          },
        ],
        total: [
          {
            count: 0,
            key: 'total',
            name: 'total',
            selected: false,
          },
        ],
        lastcreated: [
          {
            count: 0,
            key: '2020',
            name: '2020',
            selected: false,
          },
        ],
        location: [
          {
            count: 0,
            key: 'TestSource',
            name: 'TestSource',
            selected: false,
          },
        ],
        pageCount: [
          {
            count: 0,
            key: '1',
            name: '1',
          },
          {
            count: 0,
            key: '2',
            name: '2',
          },
          {
            count: 0,
            key: '3',
            name: '3',
          },
        ],
      });
    });
  });
});
