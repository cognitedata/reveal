import { useState, useEffect, useRef } from 'react';
import { reportException } from '@cognite/react-errors';
import { Metrics } from '@cognite/metrics';
import { AuthTokens, OnAuthenticateLoginObject } from '@cognite/sdk';

import { getCogniteSDKClient } from 'utils/getSDKClient';
import * as loginPersistance from 'utils/persistance';
import { AuthResult } from 'auth/types';

type AuthenticateToCdfParams = {
  project: string;
  apiKey: string | undefined;
};

export const useLoginToCdf = ({
  project,
  apiKey: maybeApiKey,
}: AuthenticateToCdfParams) => {
  const metrics = Metrics.create('useLoginToCdf', {
    project,
    isApiKey: !!maybeApiKey,
  });
  const silentlyRefreshing = useRef<boolean>(false);
  const [authResult, setAuthResult] = useState<AuthResult>();
  const client = getCogniteSDKClient();

  const onTokens = async (tokens: AuthTokens | undefined) => {
    try {
      const loginStatus = await client.login.status();

      if (loginStatus) {
        const authentication = { user: loginStatus.user, ...tokens };
        loginPersistance.persistAuthResult(authentication);
        setAuthResult(authentication);
        metrics.track('onTokens', {
          silentRefresh: !!silentlyRefreshing.current,
          success: true,
        });
      } else {
        const errorId = await reportException(
          `loginStatus null after onTokens`
        );
        metrics.track('onTokens', {
          silentRefresh: !!silentlyRefreshing.current,
          success: false,
          errorId,
        });
      }
    } catch (ex) {
      const errorId = await reportException('Failed to check login status', {
        originalError: ex,
      });
      metrics.track('onTokens', {
        silentRefresh: !!silentlyRefreshing.current,
        success: false,
        errorId,
      });
    } finally {
      // When using redirect, we don't need to explicitly do this because the
      // page will reload and reset the state. However, it's never a bad idea
      // to clean up after yourself.
      silentlyRefreshing.current = false;
    }
  };

  const onAuthenticate = (login: OnAuthenticateLoginObject) => {
    metrics.track('onAuthenticate');
    silentlyRefreshing.current = true;
    login.redirect({
      redirectUrl: window.location.href,
      errorRedirectUrl: 'https://docs.cognite.com',
    });
  };

  const authenticateForProjectWithOAuth = () => {
    const persistedAuthResult = loginPersistance.retrieveAuthResult();
    const user = persistedAuthResult ? persistedAuthResult.user : undefined;
    const accessToken = persistedAuthResult
      ? persistedAuthResult.accessToken
      : undefined;

    client.loginWithOAuth({
      project,
      accessToken,
      onTokens,
      onAuthenticate,
    });

    if (accessToken && user) {
      setAuthResult(persistedAuthResult);
      metrics.track('accessTokenCached', {
        project,
        authResult: persistedAuthResult,
      });
    } else {
      client.authenticate();
    }
  };

  const onApiKeyTokens = () => {
    onTokens(undefined);
  };

  const authenticateForProjectWithApiKey = (apiKey: string) => {
    const persistedAuthResult = loginPersistance.retrieveAuthResult();
    const user = persistedAuthResult ? persistedAuthResult.user : undefined;

    client.loginWithApiKey({ apiKey, project });
    if (user) {
      setAuthResult(persistedAuthResult);
      metrics.track('apiKeyCached', {
        project,
        authResult: persistedAuthResult,
      });
    } else {
      onApiKeyTokens();
    }
  };

  const onExpiredToken = () => {
    metrics.track('onExpiredAccessToken', {
      project,
      ...authResult,
    });

    loginPersistance.removeAuthResultFromStorage();
    client.authenticate();
  };

  useEffect(() => {
    if (maybeApiKey) {
      authenticateForProjectWithApiKey(maybeApiKey);
    } else {
      authenticateForProjectWithOAuth();
    }
  }, [project]);

  return { authResult, onExpiredToken };
};
