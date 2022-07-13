import * as msal from '@azure/msal-node';
import { CogniteClient } from '@cognite/sdk';
import open from 'open';

import processSingleIncomingRequest from './processSingleIncomingRequest';

const REDIRECT_URL = 'http://localhost:53000/';

type tokenFn = () => Promise<string>;

const getTokenImplicitFlow = (
  tenantId: string,
  clientId: string,
  baseUrl: string
): tokenFn => {
  const scopes = [`${baseUrl}/.default`];
  const pca = new msal.PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  });

  const cryptoProvider = new msal.CryptoProvider();
  const getToken: tokenFn = async () => {
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    const authCodeUrl = await pca.getAuthCodeUrl({
      scopes,
      redirectUri: REDIRECT_URL,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
    });
    await open(authCodeUrl); // NOTE: Probably not an issue but could be a source of a race condition :)
    const query = await processSingleIncomingRequest();

    const response = await pca.acquireTokenByCode({
      code: query.code,
      codeVerifier: verifier, // PKCE Code Verifier
      redirectUri: REDIRECT_URL,
      scopes,
    });

    return response.accessToken as string;
  };

  return getToken;
};

const getTokenClientCredentialsFlow = (
  tenantId: string,
  clientId: string,
  baseUrl: string,
  clientSecret: string
): tokenFn => {
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
};

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
    getToken = getTokenImplicitFlow(
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
