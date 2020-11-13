import React, { FC } from 'react';

export const TenantContext = React.createContext<string>('');

export interface TenantProviderProps {
  tenant: string;
  children: React.ReactNode;
}

export const TenantProvider: FC<TenantProviderProps> = ({
  tenant,
  children,
}) => {
  return (
    <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
  );
};
