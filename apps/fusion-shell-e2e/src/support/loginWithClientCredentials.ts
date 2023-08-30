import { ConfidentialClientApplication } from '@azure/msal-node';

export const loginWithAzureClientCredentials = async (
  DATA_EXPLORER_CLIENT_ID: string,
  DATA_EXPLORER_CLIENT_SECRET: string
) => {
  const authority = `https://login.microsoftonline.com/dssbycognite.onmicrosoft.com`;
  const scopes = [`https://greenfield.cognitedata.com/.default`];

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId: DATA_EXPLORER_CLIENT_ID,
      clientSecret: DATA_EXPLORER_CLIENT_SECRET,
    },
  });

  return cca.acquireTokenByClientCredential({
    scopes,
    authority,
  });
};
