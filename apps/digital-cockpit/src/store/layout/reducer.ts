import { createReducer } from 'typesafe-actions';
import {
  LayoutActionTypes,
  LayoutRootAction,
  LayoutState,
  BoardLayoutPayloadItem,
} from './types';

export const initialState: LayoutState = {
  loading: false,
  saving: false,
  layouts: [],
};

export const LayoutReducer = createReducer(initialState)
  .handleAction(LayoutActionTypes.LAYOUT_LOADING, (state: LayoutState) => ({
    ...state,
    loading: true,
  }))
  .handleAction(
    LayoutActionTypes.LAYOUT_LOADED,
    (state: LayoutState, action: LayoutRootAction) => ({
      ...state,
      loading: false,
      layouts: (action.payload as BoardLayoutPayloadItem[]) || [],
    })
  )
  .handleAction(LayoutActionTypes.LAYOUT_SAVING, (state: LayoutState) => ({
    ...state,
    saving: true,
  }))
  .handleAction(
    LayoutActionTypes.LAYOUT_SAVED,
    (state: LayoutState, action: LayoutRootAction) => ({
      ...state,
      saving: false,
      layouts: (action.payload as BoardLayoutPayloadItem[]) || [],
    })
  )
  .handleAction(LayoutActionTypes.LAYOUT_ERROR, (state: LayoutState) => ({
    ...state,
    loading: false,
    saving: false,
  }));
