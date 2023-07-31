import React, { FC } from 'react';

import { CdfClient } from '../utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const CdfClientContext = React.createContext<CdfClient>(null);

export interface CdfClientProviderProps {
  client: CdfClient;
  children: React.ReactNode;
}

/**
 * Do not use! Use CdfSdkContext instead
 * The 'extended' sdk (CdfClient) will be removed in favor for useQuery hooks
 * @depricated
 */
export const CdfClientProvider: FC<CdfClientProviderProps> = ({
  client,
  children,
}) => (
  <CdfClientContext.Provider value={client}>
    {children}
  </CdfClientContext.Provider>
);
