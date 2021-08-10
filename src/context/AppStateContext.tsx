import React, { useState } from 'react';
import { useLocalStorage } from '@cognite/cogs.js';
import { LS_SAVED_SETTINGS } from 'stringConstants';
import { ModelSelected } from 'modules/types';

export type AppStateContextType = {
  tenant: string;
  setTenant: (tenant: string) => void;
  cdfEnv: string;
  setCdfEnv: (cdfEnv: string) => void;
  setSavedSettings: (savedSettings: any) => void;
  skipSettings: boolean;
  setSkipSettings: (skipSettings: boolean) => void;
  modelSelected: ModelSelected;
  setModelSelected: (modelSelected: ModelSelected) => void;
};
type AppStateType = { children: React.ReactNode };

export const AppStateProvider = ({ children }: AppStateType) => {
  const [savedSettings, setSavedSettings] = useLocalStorage(LS_SAVED_SETTINGS, {
    skip: false,
    modelSelected: 'standard',
  });

  const [tenant, setTenant] = useState<string>('');
  const [cdfEnv, setCdfEnv] = useState<string>('');
  const [skipSettings, setSkipSettings] = useState<boolean>(
    () => savedSettings?.skip ?? false
  );
  const [modelSelected, setModelSelected] = useState<ModelSelected>(
    () => savedSettings?.modelSelected ?? 'standard'
  );

  return (
    <AppStateContext.Provider
      value={{
        tenant,
        setTenant,
        cdfEnv,
        setCdfEnv,
        setSavedSettings,
        skipSettings,
        setSkipSettings,
        modelSelected,
        setModelSelected,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const AppStateContext = React.createContext({} as AppStateContextType);
