import { createReducer } from '@reduxjs/toolkit';

import {
  setSortByOptions,
  setResultPanelWidth,
  setActivePanel,
} from './actions';
import { ResultPanelState, ResultPanelActions } from './types';

export const initialState = {
  sortBy: {},
} as ResultPanelState;

const resultPanelReducerCreator = createReducer(initialState, (builder) => {
  builder
    // can we do this:
    // .addCase(setSortByOptions, (state, action) => {
    //   return {
    //     ...state,
    //     sortBy: { ...state.sortBy, ...action.payload },
    //   };
    // })
    // .addCase(setResultPanelWidth, (state, action) => {
    //   return {
    //     ...state,
    //     panelWidth: action.payload,
    //   };
    // })
    // .addCase(setActivePanel, (state, action) => {
    //   return {
    //     ...state,
    //     activePanel: action.payload,
    //   };
    // });
    .addCase(setSortByOptions, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.sortBy = { ...state.sortBy, ...action.payload };
    })
    .addCase(setResultPanelWidth, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.panelWidth = action.payload;
    })
    .addCase(setActivePanel, (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.activePanel = action.payload;
    });
});

export const resultPanel = (
  state: ResultPanelState | undefined,
  action: ResultPanelActions
): ResultPanelState => {
  return resultPanelReducerCreator(state, action);
};

export default resultPanel;
