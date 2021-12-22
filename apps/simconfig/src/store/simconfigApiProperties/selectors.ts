import type { StoreState } from 'store/types';

export const selectBaseUrl = (state: StoreState) =>
  state.simconfigApiProperties.baseUrl;
export const selectAuthToken = (state: StoreState) =>
  state.simconfigApiProperties.authToken;
export const selectProject = (state: StoreState) =>
  state.simconfigApiProperties.project;
