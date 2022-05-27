import { documentFacetsStructure } from 'domain/documents/internal/types';

import { renderHook } from '@testing-library/react-hooks';
import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { useClearAllDocumentFilters } from '../useClearAllDocumentFilters';

jest.mock('services/savedSearches/useSavedSearchQuery', () => ({
  useMutatePatchSavedSearch: jest.fn(),
}));

describe('useClearAllDocumentFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useClearAllDocumentFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useClearAllDocumentFilters with empty filter options', async () => {
    const mutateAsync = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const clearAllDocumentFilters = await getHookResult();

    clearAllDocumentFilters();
    expect(mutateAsync).toHaveBeenCalledWith({
      filters: {
        documents: {
          facets: documentFacetsStructure,
        },
        extraGeoJsonFilters: [],
      },
      geoJson: [],
      query: '',
      sortBy: {},
    });
  });
});
