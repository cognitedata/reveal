import { createContext } from 'react';
import { Reveal3DResources } from '../Reveal3DResources/Reveal3DResources';
import { useSceneContainerViewModel } from './SceneContainer.viewmodel';

export type SceneContainerDependencies = {
  Reveal3DResources: typeof Reveal3DResources;
  useSceneContainerViewModel: typeof useSceneContainerViewModel;
};

export const defaultSceneContainerDependencies: SceneContainerDependencies = {
  Reveal3DResources,
  useSceneContainerViewModel
};

export const SceneContainerContext = createContext<SceneContainerDependencies>(
  defaultSceneContainerDependencies
);
