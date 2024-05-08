/*!
 * Copyright 2024 Cognite AS
 */
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  useCallback
} from 'react';
import { type SceneIdentifiers } from './sceneTypes';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';

type LoadedSceneContextType = {
  loadedScene: SceneIdentifiers | undefined;
  setScene: (scene: SceneIdentifiers) => void;
};

const LoadedSceneContext = createContext<LoadedSceneContextType | undefined>(undefined);

export const LoadedSceneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scene, setSceneState] = useState<SceneIdentifiers | undefined>(undefined);
  const revealKeepAliveData = useRevealKeepAlive();

  const setScene = useCallback(
    (scene: SceneIdentifiers) => {
      if (revealKeepAliveData !== undefined) {
        revealKeepAliveData.sceneLoadedRef.current = scene;
      }
      setSceneState(scene);
    },
    [revealKeepAliveData]
  );

  const loadedScene = useMemo(() => {
    return revealKeepAliveData?.sceneLoadedRef.current ?? scene;
  }, [scene, revealKeepAliveData]);

  return (
    <LoadedSceneContext.Provider value={{ loadedScene, setScene }}>
      {children}
    </LoadedSceneContext.Provider>
  );
};

export const useLoadedScene = (): LoadedSceneContextType => {
  const context = useContext(LoadedSceneContext);
  if (context === undefined) {
    throw new Error('useLoadedScene must be used within a LoadedSceneProvider');
  }
  return context;
};
