import { renderHook } from '@testing-library/react-hooks';

import { getMockDocumentFacets } from '__test-utils/fixtures/document';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useDocumentCategoryQuery } from 'modules/api/documents/useDocumentQuery';
import { useFacets } from 'modules/documentSearch/selectors';

import { useDocumentQueryFacets } from '../useDocumentQueryFacets';

jest.mock('modules/api/documents/useDocumentQuery', () => ({
  useDocumentCategoryQuery: jest.fn(),
}));

jest.mock('modules/documentSearch/selectors', () => ({
  useFacets: jest.fn(),
  useDocumentResultCount: jest.fn(),
  useLastAppliedFilterIsolatedFacets: jest.fn(),
}));

describe('useDocumentQueryFacets hook', () => {
  const getDocumentQueryFacetsCount = async () => {
    const store = getMockedStore();
    const { result, waitForNextUpdate } = renderHook(
      () => useDocumentQueryFacets(),
      { wrapper: ({ children }) => testWrapper({ store, children }) }
    );
    waitForNextUpdate();
    return result.current;
  };

  const facets = getMockDocumentFacets();
  const documentCategoryQueryData = {
    fileCategory: [{ name: 'PDF', count: 100 }],
    labels: [{ name: 'TestId', count: 100 }],
    location: [{ name: 'TestSource', count: 100 }],
  };

  beforeEach(() => {
    (useDocumentCategoryQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      error: null,
      data: documentCategoryQueryData,
    }));
    (useFacets as jest.Mock).mockImplementation(() => facets);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return updated document query facets count as expected', async () => {
    const { data } = await getDocumentQueryFacetsCount();

    expect(data).toEqual({
      fileCategory: [
        {
          name: documentCategoryQueryData.fileCategory[0].name,
          count: facets.filetype[0].count,
        },
      ],
      labels: [
        {
          name: documentCategoryQueryData.labels[0].name,
          count: facets.labels[0].count,
        },
      ],
      location: [
        {
          name: documentCategoryQueryData.location[0].name,
          count: facets.location[0].count,
        },
      ],
    });
  });
});
