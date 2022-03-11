import { useAuthContext } from '@cognite/react-container';
import { CogniteClient } from '@cognite/sdk';
import React from 'react';
import { EndSessionRequest } from '@azure/msal-browser';
import { getFlow, saveFlow } from '@cognite/auth-utils';

import {
  AUTH_RESULT_STORAGE_KEY,
  KEY_LAST_TENANT,
  log,
  storage,
} from '../utils';

export const Logout: React.FC = () => {
  const { client } = useAuthContext();

  React.useEffect(() => {
    storage.removeItem(AUTH_RESULT_STORAGE_KEY);
    storage.removeItem(KEY_LAST_TENANT);
    const flow = getFlow();
    saveFlow('UNKNOWN');
    // Avoid calling azure when using Fake Idp
    if (!client || flow.flow === 'FAKE_IDP') {
      window.location.pathname = '/';
      return;
    }
    // @ts-expect-error azureAdClient is private?
    const { azureAdClient } = client;
    if (azureAdClient) {
      try {
        const logOutRequest: EndSessionRequest = {
          account: azureAdClient.getAccount(),
          postLogoutRedirectUri: azureAdClient.msalApplication.getRedirectUri(),
        };
        azureAdClient.msalApplication.logout(logOutRequest);
      } catch (err) {
        if (err instanceof Error) {
          log(err.message, undefined, 3);
        } else if (typeof err === 'string') {
          log(err, undefined, 3);
        }
      } finally {
        window.location.pathname = '/';
      }
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
      if (err instanceof Error) {
        log(err.message, undefined, 3);
      } else if (typeof err === 'string') {
        log(err, undefined, 3);
      }
    } finally {
      window.location.pathname = '/';
    }
  };

  return null;
};
