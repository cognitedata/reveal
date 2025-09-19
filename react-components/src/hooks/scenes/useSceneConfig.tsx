import { useContext } from 'react';
import { type UseSceneConfigResult } from './useSceneConfig.types';
import { UseSceneConfigViewContext } from './useSceneConfig.context';

export const useSceneConfig = (
  sceneExternalId: string | undefined,
  sceneSpace: string | undefined
): UseSceneConfigResult => {
  const { UseSceneConfigViewModel } = useContext(UseSceneConfigViewContext);
  return UseSceneConfigViewModel({ sceneExternalId, sceneSpace });
};
