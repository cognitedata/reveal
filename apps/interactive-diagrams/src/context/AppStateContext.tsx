import React, { useState } from 'react';

import { useLocalStorage, SavedSettings } from '../hooks';
import { ModelSelected, ResourceCount } from '../modules/types';
import { LS_KEY_SETTINGS } from '../stringConstants';

export type PrefixType = 'custom' | 'original';
export type AppStateContextType = {
  project: string;
  setProject: (project: string) => void;
  cdfEnv: string;
  setCdfEnv: (cdfEnv: string) => void;
  setSavedSettings: (savedSettings: SavedSettings) => void;
  skipSettings: boolean;
  setSkipSettings: (skipSettings: boolean) => void;
  modelSelected: ModelSelected;
  setModelSelected: (modelSelected: ModelSelected) => void;
  resourceCount: ResourceCount;
  setResourceCount: (resourceCount: ResourceCount) => void;
  svgPrefix: string;
  setSvgPrefix: (svgPrefix: string) => void;
  prefixType: PrefixType;
  setPrefixType: (prefixType: PrefixType) => void;
};
type AppStateType = { children: React.ReactNode };

export const AppStateProvider = ({ children }: AppStateType) => {
  const [savedSettings, setSavedSettings] = useLocalStorage<SavedSettings>(
    LS_KEY_SETTINGS,
    {
      skip: false,
      modelSelected: 'standard',
    }
  );

  const [project, setProject] = useState<string>('');
  const [cdfEnv, setCdfEnv] = useState<string>('');
  const [skipSettings, setSkipSettings] = useState<boolean>(
    () => savedSettings?.skip ?? false
  );
  const [modelSelected, setModelSelected] = useState<ModelSelected>(
    () => savedSettings?.modelSelected ?? 'standard'
  );
  const [resourceCount, setResourceCount] = useState<ResourceCount>({});
  const [prefixType, setPrefixType] = useState<PrefixType>('original');
  const [svgPrefix, setSvgPrefix] = useState('Processed');

  return (
    <AppStateContext.Provider
      value={{
        project,
        setProject,
        cdfEnv,
        setCdfEnv,
        setSavedSettings,
        skipSettings,
        setSkipSettings,
        modelSelected,
        setModelSelected,
        resourceCount,
        setResourceCount,
        svgPrefix,
        setSvgPrefix,
        prefixType,
        setPrefixType,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const AppStateContext = React.createContext({} as AppStateContextType);
