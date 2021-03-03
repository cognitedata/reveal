import { RootState } from 'reducers';

export const selectActiveChartId = (state: RootState) => {
  return state.search.activeChartId;
};
