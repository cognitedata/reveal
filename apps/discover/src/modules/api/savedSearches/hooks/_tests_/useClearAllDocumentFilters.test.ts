import { renderHook } from '@testing-library/react-hooks';

import { documentFacetsStructure } from 'modules/api/documents/structure';
import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useSavedSearchQuery';

import { useClearAllDocumentFilters } from '../useClearAllDocumentFilters';

jest.mock('modules/api/savedSearches/useSavedSearchQuery', () => ({
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
