import {
  ConfidentialClientApplication,
  PublicClientApplication,
} from '@azure/msal-node';
import { DefaultArgs } from '../types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const open = require('open');

export const getAuthToken = (arg: DefaultArgs) => async () => {
  const authority = `https://login.microsoftonline.com/${arg.tenant}`;
  const clientId = arg.clientId;
  const baseUrl = `https://${arg.cluster}.cognitedata.com`;
  const scopes = [`${baseUrl}/.default`];

  if (arg.useClientSecret) {
    return (
      await new ConfidentialClientApplication({
        auth: { clientId, authority, clientSecret: arg.clientSecret },
      }).acquireTokenByClientCredential({
        scopes,
        skipCache: true,
      })
    ).accessToken;
  }

  return (
    await new PublicClientApplication({
      auth: { clientId, authority },
    }).acquireTokenByDeviceCode({
      scopes,
      deviceCodeCallback: ({ verificationUri, userCode, message }) => {
        open(verificationUri)
          .then(() =>
            console.log(`Please enter the code in browser: ${userCode}`)
          )
          .catch(() => console.log(`Failed to verify, ${message}`));
      },
    })
  ).accessToken;
};
