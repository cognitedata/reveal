import { ApiClient, CdfClient } from 'utils';
import { REDIRECT } from '@cognite/sdk';
import { RootDispatcher } from 'store/types';
import jwtDecode from 'jwt-decode';
import { intercomBoot } from 'utils/intercom';
import * as actions from './actions';

export function authenticate(
  tenant: string,
  client: CdfClient,
  apiClient: ApiClient
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.authRequest());
    client.cogniteClient.loginWithOAuth({
      project: tenant,
      onAuthenticate: REDIRECT,
      onTokens: ({ idToken, accessToken }) => {
        apiClient.keepToken(accessToken);
        const { unique_name: uniqueName } = jwtDecode(idToken);
        dispatch(actions.authSuccess(uniqueName));
        intercomBoot({ email: uniqueName });
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
