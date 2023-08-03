import { ReactElement } from 'react';

import { Loader } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import AuthWrapper from '../AuthWrapper/AuthWrapper';
import { SubAppWrapper } from '../SubAppWrapper';

export interface FusionAuthContainerProps {
  children: React.ReactNode;
  title?: string;
  sdk: CogniteClient;
  login: () => Promise<void>;
  loadingScreen?: ReactElement | null;
}

export const AuthContainer = ({
  children,
  title,
  sdk,
  login,
  loadingScreen,
}: FusionAuthContainerProps) => {
  return (
    <AuthWrapper
      loadingScreen={loadingScreen || <Loader />}
      login={() => login()}
    >
      <SDKProvider sdk={sdk}>
        <SubAppWrapper title={title}>{children}</SubAppWrapper>
      </SDKProvider>
    </AuthWrapper>
  );
};
