import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { SearchBreadcrumb, Props } from '../SearchBreadCrumb';

const defaultProps: Props = {
  stats: {
    totalResults: 0,
    currentHits: 0,
  },
};

describe('SearchBreadcrumb', () => {
  const Page = (viewStore: Store, viewProps?: any) =>
    testRenderer(SearchBreadcrumb, viewStore, viewProps);

  it('renders breadcrumb if count is greater than zero', () => {
    const store = getMockedStore();

    Page(store, { ...defaultProps, count: 200 });
    expect(screen.getByText('Showing', { exact: false })).toBeInTheDocument();
  });
});
