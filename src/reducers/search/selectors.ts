import { RootState } from 'reducers';

export const selectSearchVisibility = (state: RootState) => {
  return state.search.isVisible;
};

export const selectActiveChartId = (state: RootState) => {
  return state.search.activeChartId;
};
