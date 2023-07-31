import '__mocks/mockCogniteSDK';
import { useSearchHistoryListQuery } from 'domain/searchHistory/internal/queries/useSearchHistoryQuery';

import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { getEmptyAppliedFilterType } from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { GlobalSearch } from '../GlobalSearch';

jest.mock(
  'domain/searchHistory/internal/queries/useSearchHistoryQuery',
  () => ({
    useSearchHistoryListQuery: jest.fn(),
  })
);

jest.mock('domain/savedSearches/internal/hooks/useClearQuery.ts', () => ({
  useSetQuery: jest.fn(),
}));

jest.mock('domain/savedSearches/internal/hooks/useSavedSearch.ts', () => ({
  useSavedSearch: jest.fn(),
}));

describe('GlobalSearch', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(GlobalSearch, viewStore, viewProps);

  const defaultTestInit = async () =>
    page(
      getMockedStore({
        sidebar: {
          searchPhrase: undefined,
          appliedFilters: getEmptyAppliedFilterType(),
        },
      })
    );

  beforeEach(() => {
    (useSearchHistoryListQuery as jest.Mock).mockImplementation(() => ({
      data: [],
    }));
  });

  it('Should render input with default place holder', async () => {
    await defaultTestInit();
    expect(await screen.findByText('Search')).toBeInTheDocument();
  });
});
