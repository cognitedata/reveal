import mixpanel from 'mixpanel-browser';
import * as Sentry from '@sentry/react';
import Config from 'models/charts/config/classes/Config';
import { UserInfo } from 'models/charts/login/types/UserInfo';

const identifyUser = (
  { email, id, displayName }: UserInfo,
  project: string,
  cluster = 'europe-west1-1',
  azureADTenant?: string
) => {
  if (Config.mixpanelToken) {
    mixpanel.identify(email ?? displayName ?? id);
    mixpanel.people.set({ $name: displayName, $email: email });
    mixpanel.people.union('Projects', project);
    mixpanel.people.union('Clusters', cluster);
    if (azureADTenant) mixpanel.people.union('Azure AD Tenants', azureADTenant);
  }
  Sentry.setUser({ email, id, username: displayName });
};

export default identifyUser;
