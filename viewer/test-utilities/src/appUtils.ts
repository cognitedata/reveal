/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { PublicClientApplication, EventType } from '@azure/msal-browser';

export async function createApplicationSDK(
  appId: string,
  options: {
    project: string;
    cluster: string;
    clientId: string;
    tenantId: string;
  }
): Promise<CogniteClient> {
  const { project, cluster, clientId, tenantId } = options;

  const baseUrl = `https://${cluster}.cognitedata.com`;
  const cdfScopes = [`${baseUrl}/user_impersonation`, `${baseUrl}/IDENTITY`];

  const userScopes = ['User.Read'];

  const config = {
    auth: {
      clientId: clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: `${window.location.origin}`,
      navigateToLoginRequestUrl: true
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  };

  const redirectRequest = {
    scopes: userScopes,
    extraScopesToConsent: cdfScopes,
    redirectStartPage: window.location.href
  };

  const msalObj = new PublicClientApplication(config);

  const accountList = msalObj.getAllAccounts();
  if (accountList.length > 0) {
    msalObj.setActiveAccount(accountList[0]);
  }

  msalObj.addEventCallback(event => {
    if (event && event.eventType === EventType.LOGIN_SUCCESS && (event.payload as any).account) {
      const account = (event.payload as any).account;
      msalObj.setActiveAccount(account);
    }
  });

  await msalObj.handleRedirectPromise();

  const account = msalObj.getActiveAccount();

  if (!account) {
    msalObj.loginRedirect(redirectRequest);
  }

  const getToken = async () => {
    const account = msalObj.getActiveAccount();

    if (!account) {
      throw Error('No local account found');
    }

    const { accessToken } = await msalObj.acquireTokenSilent({
      account,
      scopes: cdfScopes
    });

    return accessToken;
  };

  const client = new CogniteClient({ appId, baseUrl, project, getToken });
  await client.authenticate();
  return client;
}
