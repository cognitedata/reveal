import { ApiClient, CdfClient } from 'utils';
import { REDIRECT } from '@cognite/sdk';
import { RootDispatcher } from 'store/types';
import jwtDecode from 'jwt-decode';
import * as Sentry from '@sentry/browser';
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
        // @ts-ignore
        const { unique_name: uniqueName } = jwtDecode(idToken);
        dispatch(actions.authSuccess(uniqueName));
      },
    });

    await client.cogniteClient
      .authenticate()
      .then((authenticated: boolean) => {
        if (!authenticated) {
          Sentry.captureMessage(
            'Could not authenticate to CDF',
            Sentry.Severity.Log
          );
        }
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
      });
  };
}
