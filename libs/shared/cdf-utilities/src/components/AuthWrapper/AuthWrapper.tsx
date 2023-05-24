import React, { ReactNode, ReactElement, useEffect, useState } from 'react';
import { Loader } from '@cognite/cogs.js';

interface AuthWrapperProps {
  login: () => Promise<void>;
  children?: ReactNode;
  loadingScreen?: ReactElement | null;
  errorScreen?: (e: Error) => ReactElement | null;
}

const AuthWrapper = ({
  children,
  loadingScreen = <Loader infoText="Loading" />,
  login,
  errorScreen,
}: AuthWrapperProps): ReactElement | null => {
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!authenticated) {
      login()
        .then(() => {
          setAuthenticated(true);
          setError(undefined);
        })
        .catch((e) => {
          setAuthenticated(false);
          setError(e);
        });
    }
  }, [authenticated, login, setAuthenticated, setError]);

  if (error && errorScreen) {
    return errorScreen(error);
  }

  if (loadingScreen && !authenticated) {
    return loadingScreen;
  }

  return <>{children}</>;
};

export default AuthWrapper;
