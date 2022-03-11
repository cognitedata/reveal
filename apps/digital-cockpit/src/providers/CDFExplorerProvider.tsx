import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import React, { FC, useMemo } from 'react';

type CDFExplorerContextProps = {
  client: CogniteClient;
  authState: AuthenticatedUser;
  handleError?: (e: Error, msg?: string) => void;
  trackMetrics?: (name: string, properties?: { [key: string]: any }) => void;
};

export const CDFExplorerContext = React.createContext<CDFExplorerContextProps>({
  client: new CogniteClient({
    appId: 'default',
    project: '',
    getToken: () => Promise.resolve(''),
  }),
  authState: {
    initialising: false,
    authenticated: false,
  },
});

export type CDFExplorerProviderProps = CDFExplorerContextProps & {
  children: React.ReactNode;
};

export const CDFExplorerProvider: FC<CDFExplorerProviderProps> = ({
  client,
  authState,
  handleError,
  trackMetrics,
  children,
}) => {
  const value = useMemo(
    () => ({ client, handleError, trackMetrics, authState }),
    [client, handleError, trackMetrics, authState]
  );
  return (
    <CDFExplorerContext.Provider value={value}>
      {children}
    </CDFExplorerContext.Provider>
  );
};
