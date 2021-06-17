import React, { FC } from 'react';
import { ApiClient } from '../utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ApiClientContext = React.createContext<ApiClient>(null);

export interface ApiClientProviderProps {
  apiClient: ApiClient;
  children: React.ReactNode;
}

export const ApiClientProvider: FC<ApiClientProviderProps> = ({
  apiClient,
  children,
}) => (
  <ApiClientContext.Provider value={apiClient}>
    {children}
  </ApiClientContext.Provider>
);
