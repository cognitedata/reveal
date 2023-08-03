import React, { PropsWithChildren } from 'react';

import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
// import { CogniteClient } from '@cognite/sdk';

export const AuthContainer = ({ children }: PropsWithChildren) => {
  return (
    <AuthWrapper loadingScreen={<Loader />} login={loginAndAuthIfNeeded}>
      {children}
    </AuthWrapper>
  );
};
