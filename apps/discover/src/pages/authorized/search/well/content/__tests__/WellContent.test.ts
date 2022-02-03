import { screen, waitFor } from '@testing-library/react';
import { Store } from 'redux';

import { getMockWell } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useWellSearchResultQuery } from 'modules/wellSearch/hooks/useWellSearchResultQuery';
import { initialState as wellState } from 'modules/wellSearch/reducer';
import { WellState } from 'modules/wellSearch/types';

// import { GETTING_STARTED_TEXT } from 'components/getting-started-panel/GettingStartedPanel';
// import { EMPTY_WELL_RESULT_TEXT } from '../WellSearchEmpty';
import Content from '../Content';

jest.mock('modules/wellSearch/hooks/useWellSearchResultQuery', () => ({
  useWellSearchResultQuery: jest.fn(),
}));

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

  it(`should render Results content page when result length greater than zero and isLoading equals false`, async () => {
    (useWellSearchResultQuery as jest.Mock).mockImplementation(() => ({
      data: [getMockWell()],
      isLoading: false,
    }));

    await defaultTestInit();

    const empty = await waitFor(() => screen.findByTestId('well-result-table'));

    expect(empty).toBeTruthy();
  });
});
