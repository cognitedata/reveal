import { getFacetsCounts } from '../getFacetsCounts';

describe('getFacetsCounts', () => {
  it('should return merged facets', async () => {
    const query = getFacetsCounts([
      { name: 'FileType', total: 10, groups: [] },
      { name: 'labels', total: 10, groups: [] },
    ]);
    expect(query).toEqual({
      FileType: 10,
      labels: 10,
    });
  });
});
