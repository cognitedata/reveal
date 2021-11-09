/* eslint-disable jest/no-export */
import { SavedSearchContent } from 'modules/api/savedSearches/types';

/*
 * Discover API TEST utils
 *
 *
 */

export const getMockQuery = (
  extras: Partial<SavedSearchContent> = {}
): SavedSearchContent => {
  return {
    query: 'test',
    filters: {
      documents: {
        facets: {
          filetype: ['PDF', 'some-unknown-filetype'],
          labels: [
            { externalId: 'TEST_TYPE_1' },
            { externalId: 'some-unknown-documentype' },
          ],
          location: ['subsurfaceconnectors'],
          lastmodified: ['2020'],
          lastcreated: ['2020'],
          pageCount: [],
        },
      },
    },
    ...extras,
  };
};

describe('Saved Search test utils', () => {
  it('should be ok', () => {
    expect(getMockQuery().query).toEqual('test');
  });
});
