import { useQueryClient } from 'react-query';

import { renderHook } from '@testing-library/react-hooks';
import { getMockedSavedSearchWithFilters } from 'services/savedSearches/__fixtures/savedSearch';
import { useSearchHistoryListQuery } from 'services/searchHistory/useSearchHistoryQuery';

import { SEARCH_HISTORY_KEY } from 'constants/react-query';
import { useCurrentSavedSearchState } from 'hooks/useCurrentSavedSearchState';

import { useUpdateSearchHistoryListQuery } from '../useUpdateSearchHistoryListQuery';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('hooks/useCurrentSavedSearchState', () => ({
  useCurrentSavedSearchState: jest.fn(),
}));

jest.mock('services/searchHistory/useSearchHistoryQuery', () => ({
  useSearchHistoryListQuery: jest.fn(),
}));

describe('useUpdateSearchHistoryListQuery hook', () => {
  const setQueryData = jest.fn();
  const currentSavedSearch = getMockedSavedSearchWithFilters(['documents']);

  it('should set query data as expected', () => {
    (useQueryClient as jest.Mock).mockImplementation(() => ({
      setQueryData,
    }));
    (useCurrentSavedSearchState as jest.Mock).mockImplementation(
      () => currentSavedSearch
    );
    (useSearchHistoryListQuery as jest.Mock).mockImplementation(() => ({
      data: [],
    }));

    const { result, waitForNextUpdate } = renderHook(() =>
      useUpdateSearchHistoryListQuery()
    );
    waitForNextUpdate();

    const updateSearchHistoryListQuery = result.current;

    updateSearchHistoryListQuery();

    expect(setQueryData).toBeCalledWith(SEARCH_HISTORY_KEY.LIST, [
      {
        name: 'default-saved-search',
        id: 'test-id',
        value: {
          filters: {
            documents: {
              facets: {
                fileCategory: ['Compressed', 'Image'],
                labels: [{ externalId: '1' }],
                lastcreated: [],
                lastmodified: [],
                location: ['Bp-Blob'],
                pageCount: ['2', '3'],
              },
            },
          },
        },
      },
    ]);
  });
});
