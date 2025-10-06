import {
  type AddResourceOptions,
  type CommonResourceContainerProps
} from '../Reveal3DResources/types';

export type SceneContainerProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
} & CommonResourceContainerProps;

export type UseSceneContainerViewModelProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
};

export type UseSceneContainerViewModelResult = {
  resourceOptions: AddResourceOptions[];
  hasResources: boolean;
  onPointCloudSettingsCallback: () => void;
};
