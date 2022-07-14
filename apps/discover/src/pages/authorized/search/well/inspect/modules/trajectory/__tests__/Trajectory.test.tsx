import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import Trajectory from '../Trajectory';

describe('Trajectory Page', () => {
  const setupStore = () => {
    const store = getMockedStore({
      inspectTabs: {
        trajectory: {
          selectedIds: {},
          selectedWellboreIds: { 759155409324993: true },
        },
      },
    });
    return store;
  };

  const renderPage = (store: Store) => testRenderer(Trajectory, store);

  it('should render ok', async () => {
    await renderPage(setupStore());

    expect(
      screen.queryByTestId('trajectory-result-table')
    ).not.toBeInTheDocument();
  });
});
