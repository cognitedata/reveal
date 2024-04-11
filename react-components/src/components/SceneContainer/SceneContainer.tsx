/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement } from 'react';
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
