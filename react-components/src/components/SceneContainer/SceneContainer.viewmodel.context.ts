import { type Context, createContext } from 'react';
import { useReveal3dResourcesFromScene } from '../../hooks/useReveal3dResourcesFromScene';
import { useGroundPlaneFromScene } from '../../hooks/useGroundPlaneFromScene';
import { useSkyboxFromScene } from '../../hooks/useSkyboxFromScene';
import { useLoadPoisForScene } from '../Architecture/pointsOfInterest/useLoadPoisForScene';
import { useQualitySettingsFromScene } from './hooks/useQualitySettingsFromScene';

export type SceneContainerViewModelDependencies = {
  useReveal3dResourcesFromScene: typeof useReveal3dResourcesFromScene;
  useGroundPlaneFromScene: typeof useGroundPlaneFromScene;
  useSkyboxFromScene: typeof useSkyboxFromScene;
  useLoadPoisForScene: typeof useLoadPoisForScene;
  useQualitySettingsFromScene: typeof useQualitySettingsFromScene;
};

export const defaultSceneContainerViewModelDependencies: SceneContainerViewModelDependencies = {
  useReveal3dResourcesFromScene,
  useGroundPlaneFromScene,
  useSkyboxFromScene,
  useLoadPoisForScene,
  useQualitySettingsFromScene
};

export const SceneContainerViewModelContext: Context<SceneContainerViewModelDependencies> =
  createContext<SceneContainerViewModelDependencies>(defaultSceneContainerViewModelDependencies);
