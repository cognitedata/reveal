import { createContext } from 'react';
import { useSceneConfig } from '../../../hooks/scenes/useSceneConfig';
import { useRenderTarget } from '../../RevealCanvas';

export type UseQualitySettingsFromSceneDependencies = {
  useSceneConfig: (
    sceneExternalId: string,
    sceneSpaceId: string
  ) => Pick<ReturnType<typeof useSceneConfig>, 'data'>;
  useRenderTarget: typeof useRenderTarget;
};

export const defaultUseQualitySettingsFromSceneDependencies: UseQualitySettingsFromSceneDependencies =
  {
    useSceneConfig: (sceneExternalId: string, sceneSpaceId: string) => {
      const result = useSceneConfig(sceneExternalId, sceneSpaceId);
      return { data: result.data };
    },
    useRenderTarget
  };

export const UseQualitySettingsFromSceneContext =
  createContext<UseQualitySettingsFromSceneDependencies>(
    defaultUseQualitySettingsFromSceneDependencies
  );
