/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement } from 'react';
import { Reveal3DResources, useSceneDefaultCamera } from '../..';
import {
  type AssetMappingStylingGroup,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../Reveal3DResources/types';
import { useReveal3dResourcesFromScene } from '../../hooks/useReveal3dResourcesFromScene';
import { useGroundPlaneFromScene } from '../../hooks/useGroundPlaneFromScene';
import { useSkyboxFromScene } from '../../hooks/useSkyboxFromScene';

export type SceneContainerProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
  defaultResourceStyling?: DefaultResourceStyling;
  instanceStyling?: Array<FdmAssetStylingGroup | AssetMappingStylingGroup>;
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

  const defaultCamera = useSceneDefaultCamera(sceneExternalId, sceneSpaceId);
  useGroundPlaneFromScene(sceneExternalId, sceneSpaceId);
  useSkyboxFromScene(sceneExternalId, sceneSpaceId);

  useEffect(() => {
    defaultCamera.fitCameraToSceneDefault();
  }, [sceneExternalId, sceneSpaceId]);

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
