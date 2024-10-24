/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { Buffer } from 'buffer';
import { EventType, PublicClientApplication } from '@azure/msal-browser';

export function withBasePath(path: string) {
  let basePath = (process.env.PUBLIC_URL || '').trim();
  console.log({ basePath, PUBLIC_URL: process.env.PUBLIC_URL });
  if (!basePath.endsWith('/')) {
    basePath += '/';
  }

  // fixme: that must be fixed for reveal manager, not here
  if (basePath.startsWith('/')) {
    basePath = basePath.slice(1);
  }

  let pathArg = path;
  if (pathArg.startsWith('/')) {
    pathArg = path.slice(1);
  }
  return basePath + pathArg;
}

export function getParamsFromURL(
  defaults: {
    project: string;
    modelUrl?: string;
  },
  queryParameters?: {
    project?: string;
    modelId?: string;
    revisionId?: string;
    modelUrl?: string;
  }
) {
  const params = {
    project: 'project',
    modelId: 'modelId',
    revisionId: 'revisionId',
    modelUrl: 'modelUrl',
    environmentParam: 'env',
    ...queryParameters
  };
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  const project = searchParams.get(params.project);
  const modelId = searchParams.get(params.modelId);
  const revisionId = searchParams.get(params.revisionId);
  const modelUrl = searchParams.get(params.modelUrl);
  const environmentParam = searchParams.get(params.environmentParam);

  const modelRevision =
    modelId !== null && revisionId !== null
      ? {
          modelId: Number.parseInt(modelId, 10),
          revisionId: Number.parseInt(revisionId, 10)
        }
      : undefined;
  return {
    project: project ? project : defaults.project,
    modelRevision,
    modelUrl: {
      fileName:
        modelUrl !== null
          ? withBasePath(modelUrl)
          : modelId === null && defaults.modelUrl
            ? withBasePath(defaults.modelUrl)
            : undefined
    },
    environmentParam
  };
}

type CredentialEnvironment = {
  tenantId: string;
  clientId: string;
  cluster: string;
};

type CredentialEnvironmentList = {
  environments: { [key: string]: CredentialEnvironment };
};

export function getCredentialEnvironment(): CredentialEnvironment | undefined {
  const url = new URL(window.location.href);
  const urlParams = url.searchParams;
  const environmentParam = urlParams.get('env');

  if (!environmentParam) {
    return undefined;
  }

  const credentialEnvironmentList = JSON.parse(
    process.env.REACT_APP_CREDENTIAL_ENVIRONMENTS!
  ) as CredentialEnvironmentList;

  return credentialEnvironmentList.environments[environmentParam];
}

export function decodeToken(token: string) {
  const splitToken = token.split('.');
  try {
    const payloadString = Buffer.from(splitToken[1], 'base64').toString('binary');
    const payloadJSON = JSON.parse(payloadString);
    return payloadJSON.aud;
  } catch (e) {
    throw new Error('Invalid override token: ' + e);
  }
}

export function createSDKFromToken(appId: string, project: string, token: string): CogniteClient {
  return new CogniteClient({
    appId,
    project,
    getToken: () => Promise.resolve(token),
    baseUrl: decodeToken(token)
  });
}

export async function createSDKFromEnvironment(
  appId: string,
  project: string,
  environmentParam: string
): Promise<CogniteClient> {
  const credentialEnvironmentList = JSON.parse(
    process.env.REACT_APP_CREDENTIAL_ENVIRONMENTS!
  ) as CredentialEnvironmentList;
  console.log('Environment list: ', credentialEnvironmentList, 'environment: ', environmentParam);
  const credentialEnvironment = credentialEnvironmentList.environments[environmentParam];

  const baseUrl = `https://${credentialEnvironment.cluster}.cognitedata.com`;
  const cdfScopes = [`${baseUrl}/user_impersonation`, `${baseUrl}/IDENTITY`];

  const userScopes = ['User.Read'];

  const config = {
    auth: {
      clientId: credentialEnvironment.clientId,
      authority: `https://login.microsoftonline.com/${credentialEnvironment.tenantId}`,
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
  await msalObj.initialize();

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

  const client = new CogniteClient({
    appId,
    project,
    getToken,
    baseUrl
  });
  await client.authenticate();
  return client;
}

export const getCogniteClient = async ({
  project,
  environment,
  overrideToken
}: {
  project: string | null;
  environment: string | null;
  overrideToken: string | null;
}): Promise<CogniteClient> => {
  if (project !== null && overrideToken !== null) {
    return createSDKFromToken('reveal.example.example', project, overrideToken);
  }

  if (project !== null && environment !== null) {
    return await createSDKFromEnvironment('reveal.example.example', project, environment);
  }

  return new CogniteClient({
    appId: 'reveal.example.example',
    project: 'dummy',
    getToken: async () => 'dummy'
  });
};
