import { documentFacetsStructure } from 'domain/documents/internal/types';
import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { renderHook } from '@testing-library/react-hooks';

import { useClearAllFilters } from '../useClearAllFilters';

jest.mock(
  'domain/savedSearches/internal/actions/usePatchSavedSearchMutate',
  () => ({
    usePatchSavedSearchMutate: jest.fn(),
  })
);

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
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
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
