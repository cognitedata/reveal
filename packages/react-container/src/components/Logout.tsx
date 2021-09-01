import React from 'react';
import { EndSessionRequest } from '@azure/msal-browser';
import { saveFlow } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';

import {
  AUTH_RESULT_STORAGE_KEY,
  KEY_LAST_TENANT,
  log,
  storage,
} from '../utils';

import { useAuthContext } from './AuthContainer';

export const Logout: React.FC = () => {
  const { client } = useAuthContext();
  const redirectUrl = `https://${window.location.host}/`;

  React.useEffect(() => {
    storage.removeItem(AUTH_RESULT_STORAGE_KEY);
    storage.removeItem(KEY_LAST_TENANT);
    saveFlow('UNKNOWN');

    if (!client) {
      window.location.pathname = redirectUrl;
      return;
    }

    // @ts-expect-error azureAdClient is private?
    const { azureAdClient } = client;
    if (azureAdClient) {
      const logOutRequest: EndSessionRequest = {
        account: azureAdClient.getAccount(),
        postLogoutRedirectUri: azureAdClient.msalApplication.getRedirectUri(),
      };
      azureAdClient.msalApplication.logout(logOutRequest);
    } else {
      legacyLogout(client);
    }
  }, [client]);

  const legacyLogout = async (client: CogniteClient) => {
    try {
      const logoutUrl = await client.logout.getUrl();
      if (logoutUrl) {
        window.open(logoutUrl);
      }
    } catch (err) {
      log(err, undefined, 3);
    } finally {
      window.location.pathname = redirectUrl;
    }
  };

  return null;
};
