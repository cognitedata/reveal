import React, { FC } from 'react';
import { CdfClient } from '../utils';

// @ts-ignore
export const CdfClientContext = React.createContext<CdfClient>(null);

export interface CdfClientProviderProps {
  client: CdfClient;
  children: React.ReactNode;
}

export const CdfClientProvider: FC<CdfClientProviderProps> = ({
  client,
  children,
}) => {
  return (
    <CdfClientContext.Provider value={client}>
      {children}
    </CdfClientContext.Provider>
  );
};
