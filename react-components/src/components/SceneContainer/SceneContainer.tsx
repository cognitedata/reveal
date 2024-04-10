/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement } from 'react';
import {
  type Image360AssetStylingGroup,
  type AssetStylingGroup,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../Reveal3DResources/types';
import { useReveal3dResourcesFromScene } from '../../hooks/useReveal3dResourcesFromScene';
import { useGroundPlaneFromScene } from '../../hooks/useGroundPlaneFromScene';
import { useSkyboxFromScene } from '../../hooks/useSkyboxFromScene';
import { Reveal3DResources } from '../Reveal3DResources/Reveal3DResources';
import { useLoadedScene } from './LoadedSceneContext';
import { useSceneDefaultCamera } from '../../hooks/useSceneDefaultCamera';

export type SceneContainerProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
  defaultResourceStyling?: DefaultResourceStyling;
  instanceStyling?: Array<FdmAssetStylingGroup | AssetStylingGroup | Image360AssetStylingGroup>;
  onResourcesAdded?: () => void;
  onResourceLoadError?: (error: any) => void;
};

export function SceneContainer({
  sceneExternalId,
  sceneSpaceId,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError
}: SceneContainerProps): ReactElement {
  const resourceOptions = useReveal3dResourcesFromScene(sceneExternalId, sceneSpaceId);
  const { loadedScene, setScene } = useLoadedScene();
  const defaultSceneCamera = useSceneDefaultCamera(sceneExternalId, sceneSpaceId);

  useEffect(() => {
    if (
      !defaultSceneCamera.isFetched ||
      (loadedScene?.externalId === sceneExternalId && loadedScene?.spaceId === sceneSpaceId)
    ) {
      return;
    }
    defaultSceneCamera.fitCameraToSceneDefault();
    setScene({ externalId: sceneExternalId, spaceId: sceneSpaceId });
  }, [defaultSceneCamera]);

  useGroundPlaneFromScene(sceneExternalId, sceneSpaceId);
  useSkyboxFromScene(sceneExternalId, sceneSpaceId);

  return (
    <Reveal3DResources
      resources={resourceOptions}
      defaultResourceStyling={defaultResourceStyling}
      instanceStyling={instanceStyling}
      onResourcesAdded={onResourcesAdded}
      onResourceLoadError={onResourceLoadError}
    />
  );
}
