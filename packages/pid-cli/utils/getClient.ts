import * as msal from '@azure/msal-node';
import { CogniteClient } from '@cognite/sdk';
import open from 'open';

import processSingleIncomingRequest from './processSingleIncomingRequest';

const AZURE_TENANT_ID = '67105506-2613-4c69-a9af-d2794c862ae7';
const CLIENT_ID = '9b263878-21b1-4178-a991-adf73e52be72';
const COGNITE_PROJECT = 'p66-dev';
const REDIRECT_URL = 'http://localhost:53000/';
const APP_ID = 'pid-cli';
const BASE_URL = 'https://az-eastus-1.cognitedata.com';
const SCOPES = ['https://az-eastus-1.cognitedata.com/.default'];

let clientInstance: CogniteClient;
const getClient = async (): Promise<CogniteClient> => {
  if (clientInstance !== undefined) {
    return clientInstance;
  }

  const pca = new msal.PublicClientApplication({
    auth: {
      clientId: CLIENT_ID,
      authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    },
  });

  const cryptoProvider = new msal.CryptoProvider();
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

  const authCodeUrlParameters = {
    scopes: SCOPES,
    redirectUri: REDIRECT_URL,
    codeChallenge: challenge,
    codeChallengeMethod: 'S256',
  };

  const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);
  await open(authCodeUrl); // NOTE: Probably not an issue but could be a source of a race condition :)
  const query = await processSingleIncomingRequest();

  const tokenRequest = {
    code: query.code,
    codeVerifier: verifier, // PKCE Code Verifier
    redirectUri: REDIRECT_URL,
    scopes: SCOPES,
  };

  const response = await pca.acquireTokenByCode(tokenRequest);
  const client = new CogniteClient({
    appId: APP_ID,
    project: COGNITE_PROJECT,
    baseUrl: BASE_URL,
    getToken: async () => response.accessToken,
  });

  await client.authenticate();

  clientInstance = client;
  return clientInstance;
};

export default getClient;
