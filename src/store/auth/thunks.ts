import { ApiClient, CdfClient } from 'utils';
import { REDIRECT } from '@cognite/sdk';
import { RootDispatcher } from 'store/types';
import jwtDecode from 'jwt-decode';
import * as actions from './actions';

export function authenticate(
  tenant: string,
  client: CdfClient,
  apiClient: ApiClient
) {
  return async (dispatch: RootDispatcher) => {
    let email: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let groups: number[];
    dispatch(actions.authRequest());
    client.cogniteClient.loginWithOAuth({
      project: tenant,
      onAuthenticate: REDIRECT,
      onTokens: ({ idToken, accessToken }) => {
        apiClient.keepToken(accessToken);
        dispatch(actions.authSuccess());
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { unique_name: uniqueName, groups: userGroups } = jwtDecode(
          idToken
        );
        email = uniqueName;
        groups = userGroups;
        // eslint-disable-next-line no-console
        console.log(`Authenticated user: ${email}`, userGroups);
      },
    });

    await client.cogniteClient
      .authenticate()
      .then((authenticated: boolean) => {
        if (!authenticated) {
          // eslint-disable-next-line no-console
          console.log('Could not authenticate to CDF');
        }
      })
      .catch((error: Error) => {
        // eslint-disable-next-line no-console
        console.log(error);
      });
  };
}
