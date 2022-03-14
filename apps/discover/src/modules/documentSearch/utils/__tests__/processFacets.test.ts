import { getMockAPIResponse } from '__test-utils/fixtures/document';

import { processFacets } from '../processFacets';

describe('processFacets', () => {
  it('should return empty facets', () => {
    const facets = processFacets({ items: [], aggregates: [] });
    expect(facets).toEqual({
      filetype: [],
      labels: [],
      total: [],
      lastcreated: [],
      location: [],
      pageCount: [],
    });
  });
  it('should return facets from document response', () => {
    const facets = processFacets(getMockAPIResponse());
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
      total: [
        {
          count: 400,
          key: 'total',
          name: 'total',
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
      pageCount: [
        {
          count: 10,
          key: '1',
          name: '1',
          selected: false,
        },
      ],
    });
  });

  it('should return accumulated count of same filetypes', () => {
    const facets = processFacets({
      items: [],
      aggregates: [
        {
          name: 'filetype',
          groups: [
            {
              group: [{ type: 'PDF' }],
              value: 100,
            },
            { group: [{ type: 'PDF' }], value: 2 },
          ],
          total: 100,
        },
      ],
    });
    expect(facets.filetype[0]).toEqual({
      name: 'PDF',
      key: 'PDF',
      count: 102,
      selected: false,
    });
  });
});
