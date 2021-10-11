import { mockAggregateResponse } from '__test-utils/fixtures/document';

import { processFacets } from '../processFacets';

describe('processFacets', () => {
  it('should return empty facets', () => {
    const facets = processFacets({ items: [], aggregates: [] });
    expect(facets).toEqual({
      filetype: [],
      labels: [],
      lastUpdatedTime: [],
      lastcreated: [],
      location: [],
    });
  });
  it('should return facets from document response', () => {
    const facets = processFacets(mockAggregateResponse);
    expect(facets).toEqual({
      filetype: [
        {
          count: 100,
          key: 'PDF',
          name: 'PDF',
          selected: false,
        },
      ],
      labels: [
        {
          count: 200,
          key: 'TestId',
          name: 'TestId',
          selected: false,
        },
      ],
      lastUpdatedTime: [
        {
          count: 400,
          key: '1396357617334',
          name: '1396357617334',
          selected: false,
        },
      ],
      lastcreated: [
        {
          count: 500,
          key: '2020',
          name: '2020',
          selected: false,
        },
      ],
      location: [
        {
          count: 300,
          key: 'TestSource',
          name: 'TestSource',
          selected: false,
        },
      ],
    });
  });
});
