import { PropsWithChildren } from 'react';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { useUserInfo } from '../../hooks/useUserInfo';

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
  return (
    <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
      <SDKProvider sdk={sdk}>
        <FusionSubAppWrapper title={title}>{children}</FusionSubAppWrapper>
      </SDKProvider>
    </AuthWrapper>
  );
};
