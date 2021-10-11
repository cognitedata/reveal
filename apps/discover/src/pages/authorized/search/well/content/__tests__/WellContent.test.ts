import { screen, waitFor } from '@testing-library/react';
import { Store } from 'redux';

import { getDefaultWell } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { initialState as wellState } from 'modules/wellSearch/reducer';
import { WellState } from 'modules/wellSearch/types';

// import { GETTING_STARTED_TEXT } from 'components/getting-started-panel/GettingStartedPanel';
// import { EMPTY_WELL_RESULT_TEXT } from '../WellSearchEmpty';
import Content from '../Content';

jest.mock('@cognite/node-visualizer', () => ({}));

describe('Well content', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(Content, viewStore, viewProps);

  const defaultTestInit = async (extra: WellState = wellState) => {
    const store = getMockedStore({ wellSearch: { ...extra } });

    return { ...page(store), store };
  };

  // now always empty, but check with new UX when it settles
  // -it(`should render Empty content page when result length equals zero and hasSearched equals true`, async () => {
  //   await defaultTestInit({
  //     ...wellState,
  //     currentQuery: { ...wellState.currentQuery, hasSearched: true },
  //   });

  //   const empty = await waitFor(() => findByText(EMPTY_WELL_RESULT_TEXT));

  //   expect(empty).toBeTruthy();
  // });

  it(`should render Results content page when result length greater than zero and hasSearched equals true`, async () => {
    const defaultWell = getDefaultWell();
    await defaultTestInit({
      ...wellState,
      currentQuery: {
        phrase: 'test',
        hasSearched: true,
      },
      wells: [defaultWell],
    });

    const empty = await waitFor(() => screen.findByTestId('well-result-table'));

    expect(empty).toBeTruthy();
  });
});
