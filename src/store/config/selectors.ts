import { StoreState } from 'store/types';
import { allApplications } from 'constants/applications';
import { ConfigState } from './types';

export const getConfigState = (state: StoreState): ConfigState => state.config;

export const getApplications = (tenantName: string = '') => (
  state: StoreState
) => {
  const { applications = [] } = getConfigState(state);
  return allApplications
    .filter((app) => applications.includes(app.key))
    .map((app) => ({ ...app, url: `${app.url}/${tenantName}` }));
};
