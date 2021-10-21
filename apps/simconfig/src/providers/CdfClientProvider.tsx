import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { AuthenticatedUser } from '@cognite/auth-utils';

interface ContextProps {
  cdfClient: CogniteClient;
  authState?: AuthenticatedUser;
}

const defaultClient: CogniteClient = new CogniteClient({
  appId: 'cognite-simulator-integration',
});

export const CdfClientContext = React.createContext<ContextProps>({
  cdfClient: defaultClient,
});

export interface CdfClientProviderProps {
  client: CogniteClient;
  children: React.ReactNode;
  authState?: AuthenticatedUser;
}

export function CdfClientProvider({
  client,
  children,
  authState,
}: CdfClientProviderProps) {
  return (
    <CdfClientContext.Provider value={{ cdfClient: client, authState }}>
      {children}
    </CdfClientContext.Provider>
  );
}
