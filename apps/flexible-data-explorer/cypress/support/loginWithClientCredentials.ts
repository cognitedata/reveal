import { ConfidentialClientApplication } from '@azure/msal-node';

export const loginWithAzureClientCredentials = async (
  clientId: string,
  clientSecret: string
) => {
  const authority = `https://login.microsoftonline.com/dssbycognite.onmicrosoft.com`;
  const scopes = [`https://greenfield.cognitedata.com/.default`];

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
    },
  });

  return cca.acquireTokenByClientCredential({
    scopes,
    authority,
  });
};
