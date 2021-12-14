/**
 * Please note that this library is designed to test the action-related,
 * not reducer-related logic (i.e., it does not update the Redux store).
 *
 * If you want a complex test combining actions and reducers together,
 * take a look at other libraries (e.g., redux-actions-assertions).
 * Refer to issue redux-mock-store#71 for more details.
 */

import configureMockStore from 'redux-mock-store';
import thunk, { ThunkMiddleware, ThunkDispatch } from 'redux-thunk';

import { getMockSidebarState } from '__test-utils/fixtures/sidebar';
import { PartialStoreState, StoreState, StoreAction } from 'core/types';
import { initialState as documentSearchState } from 'modules/documentSearch/reducer';
import { initialState as favouriteState } from 'modules/favorite/reducer';
import { initialState as feedbackState } from 'modules/feedback/reducer';
import { initialState as filterDataState } from 'modules/filterData/reducer';
import { initialState as mapState } from 'modules/map/reducer';
import { initialState as searchState } from 'modules/search/reducer';
import { initialState as seismicState } from 'modules/seismicSearch/reducer';
import { initialState as userState } from 'modules/user/reducer';
import { initialState as wellState } from 'modules/wellSearch/reducer';
import { SIDEBAR_SIZE } from 'pages/authorized/search/well/inspect/Sidebar/constants';

import { testTenant } from './testdata.utils';

const middlewares = [thunk as ThunkMiddleware<StoreState, StoreAction>];

const mockStore = configureMockStore<
  StoreState,
  ThunkDispatch<StoreState, undefined, StoreAction>
>(middlewares);

export const getMockedStore = (extraState: PartialStoreState = {}) => {
  return createMockStore({
    ...getInitialStore(),
    ...extraState,
  });
};

export const createMockStore = (initialState?: PartialStoreState) => {
  return mockStore(initialState as StoreState);
};

export const getInitialStore: () => PartialStoreState = () => {
  return {
    environment: {
      tenant: testTenant,
    },
    favourite: { ...favouriteState },
    filterData: { ...filterDataState },
    feedback: { ...feedbackState },
    seismicSearch: { ...seismicState },
    map: { ...mapState },
    documentSearch: { ...documentSearchState },
    search: { ...searchState },
    wellSearch: { ...wellState },
    user: { ...userState, user: { id: '1' } },
    sidebar: getMockSidebarState(),
    resultPanel: {
      sortBy: {},
    },
    wellInspect: {
      inspectSidebarWidth: SIDEBAR_SIZE.min,
    },
  };
};
