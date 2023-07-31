import { getMockAPIResponse } from '__test-utils/fixtures/document';

import { processFacets } from '../processFacets';

describe('processFacets', () => {
  it('should return empty facets', () => {
    const facets = processFacets({ items: [], aggregates: [] });
    expect(facets).toEqual({
      fileCategory: [],
      labels: [],
      lastcreated: [],
      total: [],
      location: [],
      pageCount: [],
    });
  });
  it('should return facets from document response', () => {
    const facets = processFacets(getMockAPIResponse());
    expect(facets).toEqual({
      fileCategory: [
        {
          count: 100,
          key: 'type',
          name: 'PDF',
          selected: false,
        },
      ],
      labels: [
        {
          count: 200,
          key: 'labels',
          name: 'TestId',
          selected: false,
        },
      ],
      total: [
        {
          count: 400,
          key: 'total',
          name: 'total',
        },
      ],
      lastcreated: [],
      location: [
        {
          count: 300,
          key: 'sourceFile.source',
          name: 'TestSource',
          selected: false,
        },
      ],
      pageCount: [
        {
          count: 10,
          key: 'pageCount',
          name: '1',
          selected: false,
        },
      ],
    });
  });

  it('should return accumulated count of same fileCategorys', () => {
    const facets = processFacets({
      items: [],
      aggregates: [
        {
          name: 'fileCategory',
          groups: [
            {
              group: [{ property: ['type'], value: 'PDF' }],
              count: 100,
            },
            {
              group: [{ property: ['type'], value: 'PDF' }],
              count: 2,
            },
          ],
          total: 100,
        },
      ],
    });
    expect(facets.fileCategory[0]).toEqual({
      name: 'PDF',
      key: 'type',
      count: 102,
      selected: false,
    });
  });
});
