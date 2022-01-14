/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { PublicClientApplication, EventType } from '@azure/msal-browser';

export function withBasePath(path: string) {
  let basePath = (process.env.PUBLIC_URL || '').trim();
  console.log({ basePath, PUBLIC_URL: process.env.PUBLIC_URL });
  if (!basePath.endsWith('/')) {
    basePath += "/";
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
    ...queryParameters,
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
          revisionId: Number.parseInt(revisionId, 10),
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
          : undefined,
    },
    environmentParam
  };
}

type CredentialEnvironment = {
  tenantId: string;
  clientId: string;
  cluster: string;
}

type CredentialEnvironmentList = {
  environments: { [key:string]: CredentialEnvironment; };
}

export function getCredentialEnvironment(): CredentialEnvironment | undefined {
  const url = new URL(window.location.href);
  const urlParams = url.searchParams;
  const environmentParam = urlParams.get('env');

  if (!environmentParam) {
    return undefined;
  }

  const credentialEnvironmentList = JSON.parse(process.env.REACT_APP_CREDENTIAL_ENVIRONMENTS!) as CredentialEnvironmentList;

  return credentialEnvironmentList.environments[environmentParam];
}


export async function createSDKFromEnvironment(
  appId: string,
  project: string,
  environmentParam: string): Promise<CogniteClient> {

    const credentialEnvironmentList = JSON.parse(process.env.REACT_APP_CREDENTIAL_ENVIRONMENTS!) as CredentialEnvironmentList;
    const credentialEnvironment = credentialEnvironmentList.environments[environmentParam];

  const baseUrl = `https://${credentialEnvironment.cluster}.cognitedata.com`;
  const scopes = [
    `${baseUrl}/DATA.VIEW`,
    `${baseUrl}/DATA.CHANGE`,
    `${baseUrl}/IDENTITY`
  ];

  const config = {
    auth: {
      clientId: credentialEnvironment.clientId,
      authority: `https://login.microsoftonline.com/${credentialEnvironment.tenantId}`
    },
    cache: {
      cacheLocation: "sessionStorage",
    },
  };

  /* const msalObj = new PublicClientApplication(config);

  const token = await msalObj.acquireTokenPopup({ scopes });

  const accounts = msalObj.getAllAccounts();
  if (accounts.length > 0) {
    msalObj.setActiveAccount(accounts[0]);
  }

  msalObj.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && (event.payload as any).account) {
      const account = (event.payload as any).account
    }
  }); */

  const getToken = async () => {
    console.log("Called gettoken");
    /* const accountId = sessionStorage.getItem('account');
    console.log("Account id = ", accountId);
    if (!accountId) {
      console.log("Calling loginredirect");
      await msalObj.loginRedirect();
      console.log("LoginRedirect called");
      throw new Error("No user id found");
    }

    const account = msalObj.getAccountByLocalId(accountId);
    if (!account) {
      throw new Error("No user found");
    }

    console.log("Active account: " + account.username); */
    /* const token = await msalObj.acquireTokenSilent({
      account,
      scopes
      }); */
    // const result = await msalObj.acquireTokenPopup({ scopes });
    console.log("Got result");

    return "AAAAAAHHHH"; // result.accessToken;
  };

  const client = new CogniteClient({ appId,
                                     project,
                                     getToken });

  return client;

  /* await client.loginWithOAuth({
      type: 'AAD_OAUTH',
      options: {
        clientId: credentialEnvironment.clientId,
        cluster: credentialEnvironment.cluster,
        tenantId: credentialEnvironment.tenantId,
      }
    });
  client.setProject(project);
  await client.authenticate(); */
}
