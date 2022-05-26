import { documentFacetsStructure } from 'domain/documents/service/types';

import { renderHook } from '@testing-library/react-hooks';
import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import {
  useClearDocumentFilters,
  useSetDocumentFilters,
} from '../useClearDocumentFilters';

jest.mock('services/savedSearches/useSavedSearchQuery', () => ({
  useMutatePatchSavedSearch: jest.fn(),
}));

describe('useClearDocumentFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useClearDocumentFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useClearDocumentFilters with empty filter options', async () => {
    const mutateAsync = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const clearDocumentFilters = await getHookResult();

    clearDocumentFilters();
    expect(mutateAsync).toHaveBeenCalledWith({
      filters: {
        documents: {
          facets: {
            fileCategory: [],
            labels: [],
            lastcreated: [],
            lastmodified: [],
            location: [],
            pageCount: [],
          },
        },
      },
    });
  });
});

describe('useSetDocumentFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSetDocumentFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSetDocumentFilters with filter option', async () => {
    const mutateAsync = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const setDocumentFilters = await getHookResult();

    const filters = documentFacetsStructure;

    setDocumentFilters(filters);
    expect(mutateAsync).toHaveBeenCalledWith({
      filters: { documents: { facets: filters } },
    });
  });
});
