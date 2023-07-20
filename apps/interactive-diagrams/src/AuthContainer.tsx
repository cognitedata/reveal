import React, { useCallback, useEffect, useState } from 'react';

import { AuthProvider, useAuth } from '@cognite/auth-react';
import sdk, {
  createSdkClient,
  loginAndAuthIfNeeded,
} from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  SubAppWrapper,
  isUsingUnifiedSignin,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { useUserInformation } from './hooks/useUserInformation';

export interface AuthProxyProviderProps {
  children: React.ReactNode;
}

export const AuthProxyProvider = ({ children }: AuthProxyProviderProps) => {
  const { getToken, getUser, logout, project, cluster, idpType } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);

  const [token, setToken] = useState<string | undefined>(undefined);

  const authenticate = useCallback(async () => {
    await getToken().then((_token) => {
      setToken(_token);
      setAuthenticated(true);
    });
  }, [getToken]);

  useEffect(() => {
    authenticate();
  });

  useEffect(() => {
    if (!authenticated && token) {
      const tokenProvider = {
        getAppId: () => 'apps.cognite.com/cdf',
        getToken,
        getUserInformation: () => {
          return getUser().then((user) => ({
            id: user.id!,
            mail: user.email,
            displayName: user.name,
            ...user,
          }));
        },
        getFlow: () => ({ flow: idpType }),
        logout,
      };
      const options = {
        appId: tokenProvider.getAppId(),
        getToken,
        baseUrl: `https://${cluster}`,
        project,
      };
      const sdkClient = createSdkClient(options, tokenProvider);
      // eslint-disable-next-line
      // @ts-ignore
      sdk.overrideInstance(sdkClient);
    }
  }, [
    authenticated,
    cluster,
    getToken,
    getUser,
    idpType,
    logout,
    project,
    token,
  ]);

  if (!authenticated) {
    return <Loader />;
  }

  return (
    <AuthWrapper
      loadingScreen={<Loader />}
      login={() => loginAndAuthIfNeeded()}
    >
      <SDKProvider sdk={sdk}>{children}</SDKProvider>
    </AuthWrapper>
  );
};

export interface FusionSubAppWrapperProps {
  children: React.ReactNode;
}

const FusionSubAppWrapper = ({ children }: FusionSubAppWrapperProps) => {
  const { data: userData } = useUserInformation();

  return (
    <SubAppWrapper
      title="Interactive Engineering Diagrams"
      userId={userData?.id}
    >
      {children}
    </SubAppWrapper>
  );
};

export interface FusionAuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: FusionAuthContainerProps) => {
  if (isUsingUnifiedSignin()) {
    return (
      <AuthProvider>
        <AuthProxyProvider>
          <FusionSubAppWrapper>{children}</FusionSubAppWrapper>
        </AuthProxyProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthWrapper
      loadingScreen={<Loader darkMode={false} />}
      login={() => loginAndAuthIfNeeded()}
    >
      <SDKProvider sdk={sdk}>
        <FusionSubAppWrapper>{children}</FusionSubAppWrapper>
      </SDKProvider>
    </AuthWrapper>
  );
};
