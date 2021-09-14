import React from 'react';
import { CogniteClient } from '@cognite/sdk';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const CdfClientContext = React.createContext<CogniteClient>(null);

export interface CdfClientProviderProps {
  client: CogniteClient;
  children: React.ReactNode;
}

export function CdfClientProvider({
  client,
  children,
}: CdfClientProviderProps) {
  return (
    <CdfClientContext.Provider value={client}>
      {children}
    </CdfClientContext.Provider>
  );
}
