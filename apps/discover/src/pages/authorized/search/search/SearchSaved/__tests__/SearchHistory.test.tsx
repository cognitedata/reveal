import { screen } from '@testing-library/react';
import { Store } from 'redux';
import { useSearchHistoryListQuery } from 'services/searchHistory/useSearchHistoryQuery';

import { getEmptyAppliedFilterType } from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { SearchHistory } from '../SearchHistory';

jest.mock('services/searchHistory/useSearchHistoryQuery', () => ({
  useSearchHistoryListQuery: jest.fn(),
}));

jest.mock('services/savedSearches/hooks/useClearQuery', () => ({
  useSetQuery: jest.fn(),
}));

jest.mock('services/savedSearches/hooks', () => ({
  useSavedSearch: jest.fn(),
}));

jest.mock('services/searchHistory/useSearchHistoryQuery', () => ({
  useSearchHistoryListQuery: jest.fn(),
}));

describe('SearchHistory', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(SearchHistory, viewStore, viewProps);

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
