import { SavedSearchContent } from '../types';

/*
 * Discover API TEST utils
 *
 *
 */
export const getSavedSearchContentFixture = (
  extras: Partial<SavedSearchContent> = {}
): SavedSearchContent => {
  return {
    query: 'test',
    filters: {
      documents: {
        facets: {
          fileCategory: ['PDF', 'some-unknown-fileCategory'],
          labels: [
            { externalId: 'TEST_TYPE_1' },
            { externalId: 'some-unknown-documentype' },
          ],
          location: ['subsurfaceconnectors'],
          lastmodified: ['1646089200000', '1646348399999'],
          lastcreated: ['1646089200000', '1646348399999'],
          pageCount: [],
        },
      },
    },
    ...extras,
  };
};
