import { RootState } from 'reducers';

export const selectCollectionsVisibility = (state: RootState) => {
  return state.collections.isVisible;
};
