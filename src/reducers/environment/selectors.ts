import { RootState } from 'reducers';

export const selectUser = (state: RootState) => {
  return state.environment.user || {};
};

export const selectTenant = (state: RootState) => {
  return state.environment.tenant;
};
