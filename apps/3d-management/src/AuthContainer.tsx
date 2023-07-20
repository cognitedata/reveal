import React, { useMemo } from 'react';

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
import { APP_TITLE } from './utils';

export interface AuthProxyProviderProps {
  children: React.ReactNode;
}

export const AuthProxyProvider = ({ children }: AuthProxyProviderProps) => {
  const { getToken, getUser, logout, project, cluster, idpType } = useAuth();

  const client = useMemo(() => {
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

    return sdkClient;
  }, [cluster, getToken, getUser, idpType, logout, project]);

  if (!client) {
    return <Loader infoText="Loading" />;
  }

  return (
    <AuthWrapper
      loadingScreen={<Loader />}
      login={() => loginAndAuthIfNeeded()}
    >
      <SDKProvider sdk={client}>{children}</SDKProvider>
    </AuthWrapper>
  );
};

export interface FusionSubAppWrapperProps {
  children: React.ReactNode;
}

const FusionSubAppWrapper = ({ children }: FusionSubAppWrapperProps) => {
  const { data: userData } = useUserInformation();

  return (
    <SubAppWrapper title={APP_TITLE} userId={userData?.id}>
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
    <AuthWrapper
      loadingScreen={<Loader />}
      login={() => loginAndAuthIfNeeded()}
    >
      <SDKProvider sdk={sdk}>
        <FusionSubAppWrapper>{children}</FusionSubAppWrapper>
      </SDKProvider>
    </AuthWrapper>
  );
};
