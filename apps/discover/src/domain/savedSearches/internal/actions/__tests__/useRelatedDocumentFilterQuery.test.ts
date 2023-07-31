import { getMockDocumentEmptyFacets } from '__test-utils/fixtures/document';
import { getMockRelatedDocumentsFilters } from '__test-utils/fixtures/relatedDocuments';
import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';

const store = getMockedStore({
  inspectTabs: {
    relatedDocuments: {
      filters: getMockRelatedDocumentsFilters(),
    },
  },
});

describe('useRelatedDocumentFilterQuery', () => {
  it('should return selected documents facets', async () => {
    const { result } = renderHookWithStore(
      () => useRelatedDocumentFilterQuery(),
      store
    );

    expect(result.current).toEqual({
      facets: {
        ...getMockDocumentEmptyFacets(),
        fileCategory: ['Test File Type 1'],
      },
      geoFilter: [],
      phrase: '',
    });
  });
});
