import { CogniteClient } from '@cognite/sdk';
import React, { FC, useMemo } from 'react';

type CDFExplorerContextProps = {
  client: CogniteClient;
  handleError?: (e: Error, msg?: string) => void;
  trackMetrics?: (name: string, properties?: { [key: string]: any }) => void;
};

export const CDFExplorerContext = React.createContext<CDFExplorerContextProps>({
  client: new CogniteClient({ appId: 'default' }),
});

export type CDFExplorerProviderProps = CDFExplorerContextProps & {
  children: React.ReactNode;
};

export const CDFExplorerProvider: FC<CDFExplorerProviderProps> = ({
  client,
  handleError,
  trackMetrics,
  children,
}) => {
  const value = useMemo(
    () => ({ client, handleError, trackMetrics }),
    [client, handleError, trackMetrics]
  );
  return (
    <CDFExplorerContext.Provider value={value}>
      {children}
    </CDFExplorerContext.Provider>
  );
};
