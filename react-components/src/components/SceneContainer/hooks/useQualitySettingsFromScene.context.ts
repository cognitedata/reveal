import { Context, createContext } from 'react';
import { useSceneConfig } from '../../../hooks/scenes/useSceneConfig';
import { useRenderTarget } from '../../RevealCanvas';
import { type Scene } from '../sceneTypes';

export type UseQualitySettingsFromSceneDependencies = {
  useSceneConfig: (
    sceneExternalId: string,
    sceneSpaceId: string
  ) => { data: Scene | null | undefined };
  useRenderTarget: typeof useRenderTarget;
};

export const defaultUseQualitySettingsFromSceneDependencies: UseQualitySettingsFromSceneDependencies =
  {
    useSceneConfig,
    useRenderTarget
  };

export const UseQualitySettingsFromSceneContext: Context<UseQualitySettingsFromSceneDependencies> =
  createContext<UseQualitySettingsFromSceneDependencies>(
    defaultUseQualitySettingsFromSceneDependencies
  );
