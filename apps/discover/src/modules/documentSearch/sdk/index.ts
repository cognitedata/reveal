import { CogniteClientPlayground } from '@cognite/sdk-playground';

let client: CogniteClientPlayground;

export const authenticateDocumentSDK = async (
  appId: string,
  baseUrl: string,
  project: string,
  accessToken?: string
) => {
  client = new CogniteClientPlayground({
    appId,
    baseUrl,
  });

  await client.loginWithOAuth({
    type: 'CDF_OAUTH',
    options: {
      project,
      onAuthenticate: (login) => {
        login.skip();
      },
      accessToken,
    },
  });
};

export const getDocumentSDKClient = () => {
  return client;
};
