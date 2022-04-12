import { renderHook } from '@testing-library/react-hooks';

import { getMockDocumentEmptyFacets } from '__test-utils/fixtures/document';

import { useRelatedDocumentFilterQuery } from '../useRelatedDocumentFilterQuery';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({
    isLoading: false,
    error: {},
    data: {
      filters: {
        documents: {
          facets: {
            fileCategory: ['Test File Type 1'],
          },
        },
      },
    },
  }),
}));
describe('useRelatedDocumentFilterQuery', () => {
  it('should return selected documents facets', async () => {
    const { result } = renderHook(() => useRelatedDocumentFilterQuery());

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
