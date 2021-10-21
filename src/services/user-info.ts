import { CogniteClient } from '@cognite/sdk';
import { UserInfo } from 'models/chart/types';

export const loginStatus = async (sdk: CogniteClient) => {
  const status = await sdk.login.status();
  if (!status) {
    return Promise.reject(new Error('no info found'));
  }
  return {
    id: status.user,
    email: status.user,
    displayName: status.user,
  } as UserInfo;
};

export const azureInfo = async (sdk: CogniteClient) => {
  const token = await sdk.getAzureADAccessToken();

  const profile = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'content-type': 'application/json',
      authorization: `bearer ${token}`,
    },
  }).then((r) => r.json());
  return {
    id: profile.id as string,
    email: profile.mail as string | undefined,
    displayName: profile.displayName as string | undefined,
  } as UserInfo;
};
