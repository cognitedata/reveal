import {
  getMockDocument,
  getMockDocumentFacets,
} from '__test-utils/fixtures/document';

import { mergeSearchResponsePages } from '../mergeSearchResponsePages';

describe('mergeSearchResponsePages', () => {
  it('should be ok', () => {
    // @ts-expect-error not full InfiniteQueryObserverSuccessResult type
    const result = mergeSearchResponsePages({
      data: {
        pageParams: [],
        pages: [
          {
            count: 2,
            facets: getMockDocumentFacets(),
            hits: [getMockDocument(), getMockDocument()],
          },
          {
            count: 2,
            facets: getMockDocumentFacets(),
            hits: [getMockDocument(), getMockDocument()],
          },
        ],
      },
      isLoading: false,
    });
    expect(result.results.count).toEqual(4);
    expect(result.results.hits.length).toEqual(4);
  });
});
