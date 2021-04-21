import { StoreState } from 'store/types';
import { ConfigState } from './types';
import { allApplications } from 'constants/applications';

export const getConfigState = (state: StoreState): ConfigState => state.config;

export const getApplications = (state: StoreState) => {
  const { applications = [] } = getConfigState(state);
  return allApplications.filter((app) => !applications.includes(app.key));
};
