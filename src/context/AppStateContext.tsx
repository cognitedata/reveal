import React, { useState } from 'react';

export type AppStateContextType = {
  tenant: string;
  setTenant: (tenant: string) => void;
  cdfEnv: string;
  setCdfEnv: (cdfEnv: string) => void;
};
type AppStateType = { children: React.ReactNode };

export const AppStateProvider = ({ children }: AppStateType) => {
  const [tenant, setTenant] = useState<string>('');
  const [cdfEnv, setCdfEnv] = useState<string>('');

  return (
    <AppStateContext.Provider
      value={{
        tenant,
        setTenant,
        cdfEnv,
        setCdfEnv,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const AppStateContext = React.createContext({} as AppStateContextType);
