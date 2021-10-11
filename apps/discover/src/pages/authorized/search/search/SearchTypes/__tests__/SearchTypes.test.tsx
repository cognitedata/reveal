import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { SearchTypes } from '../SearchTypes';

jest.mock('modules/api/searchHistory/useSearchHistoryQuery', () => ({
  useSearchHistoryListQuery: jest.fn,
}));
jest.mock('modules/api/savedSearches/hooks/useClearQuery', () => ({
  useSetQuery: jest.fn,
}));
jest.mock('modules/api/savedSearches/hooks', () => ({
  useSavedSearch: jest.fn,
}));

describe('SearchHistory', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(SearchTypes, viewStore, viewProps);
  const defaultTestInit = async () =>
    page(getMockedStore({ sidebar: { searchPhrase: undefined } }));

  it('Should render input with default place holder', async () => {
    await defaultTestInit();
    expect(await screen.findByText('Search')).toBeInTheDocument();
  });
});
