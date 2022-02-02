/**
 * Please note that this library is designed to test the action-related,
 * not reducer-related logic (i.e., it does not update the Redux store).
 *
 * If you want a complex test combining actions and reducers together,
 * take a look at other libraries (e.g., redux-actions-assertions).
 * Refer to issue redux-mock-store#71 for more details.
 */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState as fileState } from 'src/modules/Common/store/files/slice';
import { initialState as fileDetailsState } from 'src/modules/FileDetails/fileDetailsSlice';
import { initialState as processState } from 'src/modules/Process/processSlice';
import { RootState } from 'src/store/rootReducer';
import { initialState as annotationState } from 'src/modules/Common/store/annotation/slice';

// Crate a mock store for testing Redux async action creators and middleware.
// The mock store will create an array of dispatched actions which serve as an action log for tests.
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

export type StoreState = Partial<RootState>;

export const getInitialStore: () => StoreState = () => {
  return {
    fileReducer: fileState,
    fileDetailsSlice: fileDetailsState,
    processSlice: processState,
    annotationReducer: annotationState,
  };
};

export const createMockStore = (initialState?: StoreState) => {
  return mockStore(initialState);
};

export const getMockedStore = (extraState?: StoreState) => {
  return createMockStore({
    ...getInitialStore(),
    ...extraState,
  });
};
