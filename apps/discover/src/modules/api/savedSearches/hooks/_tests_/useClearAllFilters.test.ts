import { renderHook } from '@testing-library/react-hooks';

import { documentFacetsStructure } from 'modules/api/documents/structure';
import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useSavedSearchQuery';

import { useClearAllFilters } from '../useClearAllFilters';

jest.mock('modules/api/savedSearches/useSavedSearchQuery', () => ({
  useMutatePatchSavedSearch: jest.fn(),
}));

describe('useClearAllFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useClearAllFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useClearAllFilters with empty filter options', async () => {
    const mutateAsync = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const clearAllFilters = await getHookResult();

    clearAllFilters();
    expect(mutateAsync).toHaveBeenCalledWith({
      filters: {
        documents: {
          facets: documentFacetsStructure,
        },
        wells: {},
      },
      geoJson: [],
      query: '',
      sortBy: {},
    });
  });
});
