import { CogniteClient } from '@cognite/sdk';
import React, { FC, useMemo } from 'react';

export const CogniteSDKContext = React.createContext<{
  client: CogniteClient;
}>({ client: new CogniteClient({ appId: 'default' }) });

export interface CogniteSDKProviderProps {
  client: CogniteClient;
  children: React.ReactNode;
}

export const CogniteSDKProvider: FC<CogniteSDKProviderProps> = ({
  client,
  children,
}) => {
  const value = useMemo(() => ({ client }), [client]);
  return (
    <CogniteSDKContext.Provider value={value}>
      {children}
    </CogniteSDKContext.Provider>
  );
};
