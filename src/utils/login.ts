import { CogniteClient } from '@cognite/sdk';
import { UserInfo } from 'reducers/charts/types';

export const getLoginStatus = async (sdk: CogniteClient) => {
  const authFlow = sdk.getOAuthFlowType();

  try {
    switch (authFlow) {
      case 'CDF_OAUTH': {
        return loginStatus(sdk);
      }
      case 'AAD_OAUTH': {
        return azureInfo(sdk);
      }
      default: {
        return Promise.reject(
          new Error(
            `User info for this auth flow (${authFlow}) is not supported`
          )
        );
      }
    }
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

const loginStatus = async (sdk: CogniteClient) => {
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

const azureInfo = async (sdk: CogniteClient) => {
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
