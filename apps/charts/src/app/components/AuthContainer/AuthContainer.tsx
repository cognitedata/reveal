import { PropsWithChildren, useEffect, useState } from 'react';

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

import { useUserInfo } from '../../hooks/useUserInfo';

export const AuthProxyProvider = ({ children }: PropsWithChildren) => {
  const { getToken, getUser, logout, project, cluster, idpType } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);

  // When loading initially, the sdk is going to be null
  // create one using the getToken function and cluster from above
  useEffect(() => {
    if (!authenticated) {
      const tokenProvider = {
        getToken,
        logout,
        getFlow: () => ({ flow: idpType }),
        getAppId: () => 'apps.cognite.com/cdf',
        getUserInformation: () => {
          return getUser().then((user) => ({
            id: user.id!,
            mail: user.email,
            displayName: user.name,
            ...user,
          }));
        },
      };

      const sdkClient = createSdkClient(
        {
          getToken,
          appId: tokenProvider.getAppId(),
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

const FusionSubAppWrapper = ({
  children,
  title,
}: PropsWithChildren<{ title: string }>) => {
  const { data: userInfo } = useUserInfo();

  return (
    <SubAppWrapper title={title} userId={userInfo?.id}>
      {children}
    </SubAppWrapper>
  );
};

export const AuthContainer = ({
  children,
  title,
}: PropsWithChildren<{ title: string }>) => {
  if (isUsingUnifiedSignin()) {
    return (
      <AuthProvider
      //  loader={<Loader />}
      >
        <AuthProxyProvider>
          <FusionSubAppWrapper title={title}>{children}</FusionSubAppWrapper>
        </AuthProxyProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
      <SDKProvider sdk={sdk}>
        <FusionSubAppWrapper title={title}>{children}</FusionSubAppWrapper>
      </SDKProvider>
    </AuthWrapper>
  );
};
