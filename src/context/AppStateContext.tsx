import React, { useState } from 'react';
import { useLocalStorage } from '@cognite/cogs.js';
import { LS_SAVED_SETTINGS } from 'stringConstants';
import { ModelSelected, ResourceCount, JobStatus } from 'modules/types';

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
  resourceCount: ResourceCount;
  setResourceCount: (resourceCount: ResourceCount) => void;
  jobStarted: boolean;
  setJobStarted: (jobStarted: boolean) => void;
  jobStatus: JobStatus;
  setJobStatus: (jobStatus: JobStatus) => void;
};
type AppStateType = { children: React.ReactNode };

export const AppStateProvider = ({ children }: AppStateType) => {
  const [savedSettings, setSavedSettings] = useLocalStorage(LS_SAVED_SETTINGS, {
    skip: false,
    modelSelected: 'standard',
  });

  const [tenant, setTenant] = useState<string>('');
  const [cdfEnv, setCdfEnv] = useState<string>('');
  const [jobStarted, setJobStarted] = useState<boolean>(false);
  const [jobStatus, setJobStatus] = useState<JobStatus>('ready');
  const [skipSettings, setSkipSettings] = useState<boolean>(
    () => savedSettings?.skip ?? false
  );
  const [modelSelected, setModelSelected] = useState<ModelSelected>(
    () => savedSettings?.modelSelected ?? 'standard'
  );
  const [resourceCount, setResourceCount] = useState<ResourceCount>({});

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
        resourceCount,
        setResourceCount,
        jobStarted,
        setJobStarted,
        jobStatus,
        setJobStatus,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const AppStateContext = React.createContext({} as AppStateContextType);
