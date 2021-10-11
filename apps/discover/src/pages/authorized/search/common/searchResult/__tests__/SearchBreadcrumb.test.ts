import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { initialState as documentSearchState } from 'modules/documentSearch/reducer';

import { SearchBreadcrumb, Props } from '../SearchBreadCrumb';

const defaultProps: Props = {
  stats: {
    totalResults: 0,
    currentHits: 0,
  },
  // content: []
};

describe('SearchBreadcrumb', () => {
  const Page = (viewStore: Store, viewProps?: any) =>
    testRenderer(SearchBreadcrumb, viewStore, viewProps);

  it('renders nothing when document is falsy', () => {
    const store = getMockedStore();
    Page(store, defaultProps);
    expect(
      screen.queryByText('Showing', { exact: false })
    ).not.toBeInTheDocument();
  });

  it('renders breadcrumb if count is greater than zero', () => {
    const store = getMockedStore({
      documentSearch: {
        ...documentSearchState,
        result: {
          ...documentSearchState.result,
          aggregates: [],
        },
        currentDocumentQuery: {
          hasSearched: true,
        },
      },
    });

    Page(store, { ...defaultProps, count: 200 });
    expect(screen.getByText('Showing', { exact: false })).toBeInTheDocument();
  });
});
