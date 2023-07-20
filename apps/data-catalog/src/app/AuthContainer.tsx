import React, { useEffect, useState } from 'react';

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

  // When loading initially, the sdk is going to be null
  // create one using the getToken function and cluster from above
  useEffect(() => {
    if (!authenticated) {
      const tokenProvider = {
        getAppId: () => 'apps.cognite.com/cdf',
        getToken,
        getUserInformation: () => {
          return getUser().then((user) => ({
            id: user.id!,
            mail: user.email,
            displayName: user.name,
          }));
        },
        getFlow: () => ({ flow: idpType }),
        logout,
      };
      const sdkClient = createSdkClient(
        {
          appId: tokenProvider.getAppId(),
          getToken,
          baseUrl: `https://${cluster}`,
          project,
        },
        tokenProvider
      );
      // eslint-disable-next-line
      // @ts-ignore
      sdk.overrideInstance(sdkClient);
      setAuthenticated(true);
    }
  }, [authenticated, getToken, project, cluster, logout, getUser, idpType]);

  if (!authenticated) {
    return <Loader infoText="Loading" />;
  }

  return (
    <SDKProvider sdk={sdk}>
      <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
        {children}
      </AuthWrapper>
    </SDKProvider>
  );
};

export interface FusionSubAppWrapperProps {
  children: React.ReactNode;
}

const FusionSubAppWrapper = ({ children }: FusionSubAppWrapperProps) => {
  const { data: userData } = useUserInformation();
  return (
    <SubAppWrapper title="Data catalog" userId={userData?.id}>
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
      <AuthProvider loader={<Loader infoText="Loading" />}>
        <AuthProxyProvider>
          <FusionSubAppWrapper>{children}</FusionSubAppWrapper>
        </AuthProxyProvider>
      </AuthProvider>
    );
  }
  return (
    <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
      <SDKProvider sdk={sdk}>
        <FusionSubAppWrapper>{children}</FusionSubAppWrapper>
      </SDKProvider>
    </AuthWrapper>
  );
};
