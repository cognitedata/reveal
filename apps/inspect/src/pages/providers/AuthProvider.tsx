import { AuthContext } from '@cognite/react-container';
import * as React from 'react';

import { setClient } from '../../utils/getCogniteClientSDK';

export const ProvideAuthSetup: React.FC<
  React.PropsWithChildren<{
    authState: AuthContext;
  }>
> = ({ authState, children }) => {
  if (authState.client) {
    setClient(authState.client);
  }

  return authState.authState?.authenticated ? <>{children}</> : null;
};
