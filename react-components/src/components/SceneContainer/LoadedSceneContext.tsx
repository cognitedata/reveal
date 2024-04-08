/*!
 * Copyright 2024 Cognite AS
 */
import {
  type ReactElement,
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo
} from 'react';
import { type SceneIdentifiers } from './SceneTypes';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';

type LoadedSceneContextType = {
  loadedScene: SceneIdentifiers | undefined;
  setScene: (scene: SceneIdentifiers) => void;
};

const LoadedSceneContext = createContext<LoadedSceneContextType | undefined>(undefined);

export const LoadedSceneProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [scene, setScene] = useState<SceneIdentifiers | undefined>(undefined);
  const revealKeepAliveData = useRevealKeepAlive();

  const loadedSceneRef = useMemo(() => {
    if (revealKeepAliveData === undefined) {
      return undefined;
    }
    const existingScene = revealKeepAliveData?.isSceneLoadedRef.current ?? scene;

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.isSceneLoadedRef.current = existingScene;
    }
    return revealKeepAliveData.isSceneLoadedRef.current;
  }, [scene]);

  const loadedScene = scene ?? loadedSceneRef;

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
