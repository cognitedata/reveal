import { createReducer } from 'typesafe-actions';
import {
  ImgUrlLink,
  SuitesTableActionTypes,
  SuitesTableRootAction,
  SuitesTableState,
} from './types';

const getInitialImageUrls = () => ({
  loading: false,
  urls: [],
});

const initialState: SuitesTableState = {
  loading: false,
  loaded: false,
  error: '',
  suites: null,
  imageUrls: getInitialImageUrls(),
};

export const SuitesReducer = createReducer(initialState)
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_REQUEST_SUCCESS,
    (state: SuitesTableState) => ({
      ...state,
      loading: false,
      error: '',
      loaded: true,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOAD,
    (state: SuitesTableState) => ({ ...state, loading: true, error: '' })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOADED,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      loading: false,
      error: '',
      loaded: true,
      suites: action.payload,
      imageUrls: getInitialImageUrls(),
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOAD_ERROR,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT,
    (state: SuitesTableState) => ({ ...state, loading: true, error: '' })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT_ERROR,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE,
    (state: SuitesTableState) => ({
      ...state,
      loading: true,
      error: '',
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE_ERROR,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  )
  .handleAction(
    SuitesTableActionTypes.FETCH_IMG_URLS,
    (state: SuitesTableState) => ({
      ...state,
      imageUrls: {
        loading: true,
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
        urls: action.payload as ImgUrlLink[],
      },
    })
  )
  .handleAction(
    SuitesTableActionTypes.FETCH_IMG_URLS_ERROR,
    (state: SuitesTableState) => ({
      ...state,
      imageUrls: {
        loading: false,
        urls: [], // silent mode. track to Sentry?
      },
    })
  );
