/**
 * Please note that redux-mock-store library is designed to test the action-related,
 * not reducer-related logic
 * (i.e., it does not update the Redux store, use real store if state needs to update).
 *
 * If you want a complex test combining actions and reducers together,
 * take a look at other libraries (e.g., redux-actions-assertions).
 * Refer to issue redux-mock-store#71 for more details.
 */

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState as fileState } from 'src/modules/Common/store/files/slice';
import { initialState as fileDetailsState } from 'src/modules/FileDetails/slice';
import { initialState as processState } from 'src/modules/Process/store/slice';
import { initialState as annotationState } from 'src/modules/Common/store/annotation/slice';
import { initialState as annotationLabelState } from 'src/modules/Review/store/annotationLabel/slice';
import rootReducer, { RootState } from 'src/store/rootReducer';

export type StoreState = Partial<RootState>;

export const getInitialState: () => StoreState = () => {
  return {
    fileReducer: fileState,
    fileDetailsSlice: fileDetailsState,
    processSlice: processState,
    annotationReducer: annotationState,
    annotationLabelReducer: annotationLabelState,
  };
};

/** Mock Store */
// Crate a mock store for testing Redux async action creators and middleware.
// The mock store will create an array of dispatched actions which serve as an action log for tests.

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

export const createMockStore = (initialState?: StoreState) => {
  return mockStore(initialState);
};

export const getMockedStore = (extraState?: StoreState) => {
  return createMockStore({
    ...getInitialState(),
    ...extraState,
  });
};

/** Real Store for test
 * Use real store to render components when expecting state change by actions.
 * As redux-mock-store library doesn't allow testing the state change.
 */

export const createRealStoreForTest = (initialState?: StoreState) => {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({}),
    preloadedState: initialState,
  });
};

export const getRealStore = (extraState?: StoreState) => {
  return createRealStoreForTest({
    ...getInitialState(),
    ...extraState,
  });
};
