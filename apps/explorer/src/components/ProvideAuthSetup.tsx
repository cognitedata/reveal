import * as React from 'react';
import { setClient } from 'utils/getCogniteSDKClient';
import { getProjectInfo, AuthContext } from '@cognite/react-container';

export const ProvideAuthSetup: React.FC<
  React.PropsWithChildren<{
    authState: AuthContext;
  }>
> = ({ authState, children }) => {
  const [doneAuth, setDoneAuth] = React.useState(false);
  const [project] = getProjectInfo();

  React.useEffect(() => {
    if (authState.client) {
      if (authState.client) {
        setClient(authState.client);
      }

      setDoneAuth(true);
    }
  }, [authState.authState?.authenticated, project]);

  return doneAuth ? <>{children}</> : null;
};
