import { createContext } from 'react';
import { use3dScenes } from './use3dScenes';

export type UseSceneConfigDependencies = {
  use3dScenes: typeof use3dScenes;
};

export const defaultUseSceneConfigDependencies: UseSceneConfigDependencies = {
  use3dScenes
};

export const UseSceneConfigContext = createContext<UseSceneConfigDependencies>(
  defaultUseSceneConfigDependencies
);
