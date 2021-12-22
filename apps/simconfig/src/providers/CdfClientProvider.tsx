import React, { useMemo } from 'react';

import type { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';

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
  const props = useMemo(
    () => ({ cdfClient: client, authState }),
    [client, authState]
  );
  return (
    <CdfClientContext.Provider value={props}>
      {children}
    </CdfClientContext.Provider>
  );
}
