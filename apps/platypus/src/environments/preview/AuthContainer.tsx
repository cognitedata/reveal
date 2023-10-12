import React from 'react';

import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

export interface FusionAuthContainerProps {
  children: React.ReactNode;
}
export const AuthContainer = ({ children }: FusionAuthContainerProps) => {
  return (
    <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
      {children}
    </AuthWrapper>
  );
};
