import { RootState } from 'reducers';

export const selectSearchVisibility = (state: RootState) => {
  return state.search.isVisible;
};
