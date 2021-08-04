import React from 'react';
import {
  KEY_LAST_TENANT,
  AUTH_RESULT_STORAGE_KEY,
  useAuthContext,
  storage,
} from '@cognite/react-container';
import { EndSessionRequest } from '@azure/msal-browser';
import { saveFlow } from '@cognite/auth-utils';

export const Logout: React.FC = () => {
  const { client } = useAuthContext();

  React.useEffect(() => {
    storage.removeItem(AUTH_RESULT_STORAGE_KEY);
    storage.removeItem(KEY_LAST_TENANT);
    saveFlow('UNKNOWN');

    // @ts-expect-error azureAdClient is private?
    const azureAdClient = client?.azureAdClient;
    if (azureAdClient) {
      if (!azureAdClient) {
        // this is E2E testing mode (aka: fake idp)
        window.location.href = '/';
      }

      const logOutRequest: EndSessionRequest = {
        account: azureAdClient.getAccount(),
        postLogoutRedirectUri: azureAdClient.msalApplication.getRedirectUri(),
      };
      azureAdClient.msalApplication.logout(logOutRequest);
    } else {
      window.location.href = '/';
    }
  }, [client]);

  return null;
};
