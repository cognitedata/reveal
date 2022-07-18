/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { StoreState } from 'store/types';

export const selectBaseUrl = (state: StoreState) =>
  state.simconfigApiProperties.baseUrl;
export const selectAuthHeaders = (state: StoreState) =>
  state.simconfigApiProperties.authHeaders;
export const selectProject = (state: StoreState): string =>
  state.simconfigApiProperties.project;
