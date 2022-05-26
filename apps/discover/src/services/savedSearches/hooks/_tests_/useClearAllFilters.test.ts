import { documentFacetsStructure } from 'domain/documents/service/types';

import { renderHook } from '@testing-library/react-hooks';
import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { useClearAllFilters } from '../useClearAllFilters';

jest.mock('services/savedSearches/useSavedSearchQuery', () => ({
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
