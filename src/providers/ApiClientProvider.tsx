import React, { FC } from 'react';
import { ApiClient } from '../utils';

// @ts-ignore
export const ApiClientContext = React.createContext<ApiClient>(null);

export interface ApiClientProviderProps {
  apiClient: ApiClient;
  children: React.ReactNode;
}

export const ApiClientProvider: FC<ApiClientProviderProps> = ({
  apiClient,
  children,
}) => {
  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
};
