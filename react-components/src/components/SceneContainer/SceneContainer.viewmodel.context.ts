import { createContext } from 'react';
import { useReveal3dResourcesFromScene } from '../../hooks/useReveal3dResourcesFromScene';
import { useGroundPlaneFromScene } from '../../hooks/useGroundPlaneFromScene';
import { useSkyboxFromScene } from '../../hooks/useSkyboxFromScene';
import { useLoadPoisForScene } from '../Architecture/pointsOfInterest/useLoadPoisForScene';

export type SceneContainerViewModelDependencies = {
  useReveal3dResourcesFromScene: typeof useReveal3dResourcesFromScene;
  useGroundPlaneFromScene: typeof useGroundPlaneFromScene;
  useSkyboxFromScene: typeof useSkyboxFromScene;
  useLoadPoisForScene: typeof useLoadPoisForScene;
};

export const defaultSceneContainerViewModelDependencies: SceneContainerViewModelDependencies = {
  useReveal3dResourcesFromScene,
  useGroundPlaneFromScene,
  useSkyboxFromScene,
  useLoadPoisForScene
};

export const SceneContainerViewModelContext = createContext<SceneContainerViewModelDependencies>(
  defaultSceneContainerViewModelDependencies
);
