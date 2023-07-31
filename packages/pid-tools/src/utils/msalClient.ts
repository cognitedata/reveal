import * as msal from '@azure/msal-node';
import { CogniteClient } from '@cognite/sdk';

import processRedirect from './processRedirect';

const REDIRECT_URL = 'http://localhost:53000/';

type tokenFn = () => Promise<string>;

async function getTokenImplicitFlow(
  tenantId: string,
  clientId: string,
  baseUrl: string
): Promise<tokenFn> {
  const scopes = [`${baseUrl}/.default`];
  const pca = new msal.PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  });

  const cryptoProvider = new msal.CryptoProvider();
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

  const authCodeUrl = await pca.getAuthCodeUrl({
    scopes,
    redirectUri: REDIRECT_URL,
    codeChallenge: challenge,
    codeChallengeMethod: 'S256',
  });

  const code = await processRedirect(authCodeUrl);

  const res = await pca.acquireTokenByCode({
    code,
    codeVerifier: verifier, // PKCE Code Verifier
    redirectUri: REDIRECT_URL,
    scopes,
  });

  const getToken: tokenFn = async () => res.accessToken;
  return getToken;
}

function getTokenClientCredentialsFlow(
  tenantId: string,
  clientId: string,
  baseUrl: string,
  clientSecret: string
): tokenFn {
  const scopes = [`${baseUrl}/.default`];
  const pca = new msal.ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  });

  const getToken: tokenFn = async () => {
    const response = await pca.acquireTokenByClientCredential({
      scopes,
      skipCache: true,
    });
    return response?.accessToken as string;
  };

  return getToken;
}

export interface MsalClientOptions {
  /** App identifier (ex: 'FileExtractor') */
  appId?: string;
  /** URL to Cognite cluster, e.g 'https://greenfield.cognitedata.com' * */
  baseUrl: string;
  /** Project name */
  project: string;
  /** optional OIDC client secret */
  clientSecret?: string;
  /** OIDC tenant ID */
  tenantId: string;
  /** OIDC client ID */
  clientId: string;
}
export async function getMsalClient(
  options: MsalClientOptions
): Promise<CogniteClient> {
  const appId = options.appId === undefined ? 'pid-tools' : options.appId;
  let getToken: tokenFn;
  if (options.clientSecret === undefined) {
    getToken = await getTokenImplicitFlow(
      options.tenantId,
      options.clientId,
      options.baseUrl
    );
  } else {
    getToken = getTokenClientCredentialsFlow(
      options.tenantId,
      options.clientId,
      options.baseUrl,
      options.clientSecret
    );
  }

  const client = new CogniteClient({
    appId,
    project: options.project,
    baseUrl: options.baseUrl,
    getToken,
  });
  await client.authenticate();
  return client;
}

export default getMsalClient;
