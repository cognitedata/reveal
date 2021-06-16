import { createReducer } from 'typesafe-actions';
import {
  ImgUrlLink,
  SuitesTableActionTypes,
  SuitesTableRootAction,
  SuitesTableState,
} from './types';

export const getInitialImageUrls = () => ({
  loading: false,
  loaded: false,
  failed: false,
  urls: [],
});

export const initialState: SuitesTableState = {
  loading: false,
  loaded: false,
  loadFailed: false,
  suites: null,
  imageUrls: getInitialImageUrls(),
};

export const SuitesReducer = createReducer(initialState)
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOAD,
    (state: SuitesTableState) => ({
      ...state,
      loading: true,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOADED,
    (_: SuitesTableState, action: SuitesTableRootAction) => ({
      loading: false,
      loadFailed: false,
      loaded: true,
      suites: action.payload,
      imageUrls: getInitialImageUrls(),
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOAD_FAILED,
    (state: SuitesTableState) => ({
      ...state,
      loading: false,
      loadFailed: true,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITE_SAVE,
    (state: SuitesTableState) => ({ ...state, loading: true })
  )
  .handleAction(
    SuitesTableActionTypes.SUITE_ERROR,
    (state: SuitesTableState) => ({
      ...state,
      loading: false,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITE_DELETE,
    (state: SuitesTableState) => ({
      ...state,
      loading: true,
    })
  )
  .handleAction(
    SuitesTableActionTypes.FETCH_IMG_URLS,
    (state: SuitesTableState) => ({
      ...state,
      imageUrls: {
        loading: true,
        loaded: false,
        failed: false,
        urls: [],
      },
    })
  )
  .handleAction(
    SuitesTableActionTypes.FETCHED_IMG_URLS,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      imageUrls: {
        loading: false,
        loaded: true,
        failed: false,
        urls: action.payload as ImgUrlLink[],
      },
    })
  )
  .handleAction(
    SuitesTableActionTypes.FETCH_IMG_URLS_FAILED,
    (state: SuitesTableState) => ({
      ...state,
      imageUrls: {
        loading: false,
        loaded: false,
        failed: true,
        urls: [],
      },
    })
  )
  .handleAction(
    SuitesTableActionTypes.CLEAR_IMG_URLS,
    (state: SuitesTableState) => ({
      ...state,
      imageUrls: getInitialImageUrls(),
    })
  );
