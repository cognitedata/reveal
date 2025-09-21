import { type UseQueryResult } from '@tanstack/react-query';
import { type Scene } from '../../components/SceneContainer/sceneTypes';

export type UseSceneConfigProps = {
  sceneExternalId: string | undefined;
  sceneSpace: string | undefined;
};

export type UseSceneConfigResult = UseQueryResult<Scene | null>;

export type UseSceneConfigViewModelProps = UseSceneConfigProps;

export type UseSceneConfigViewModelResult = UseSceneConfigResult;
