import { documentFacetsStructure } from 'domain/documents/internal/types';
import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { renderHook } from '@testing-library/react-hooks';

import { useClearAllDocumentFilters } from '../useClearAllDocumentFilters';

jest.mock(
  'domain/savedSearches/internal/actions/usePatchSavedSearchMutate',
  () => ({
    usePatchSavedSearchMutate: jest.fn(),
  })
);

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
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
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
