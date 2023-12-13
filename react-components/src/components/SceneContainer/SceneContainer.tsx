/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement } from 'react';
import { Reveal3DResources } from '../..';
import { type CogniteClient } from '@cognite/sdk';
import {
  type AssetMappingStylingGroup,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../Reveal3DResources/types';
import { useReveal3dResourcesFromScene } from '../../hooks/useReveal3dResourcesFromScene';
import { useGroundPlaneFromScene } from '../../hooks/useGroundPlaneFromScene';
import { useSkyboxFromScene } from '../../hooks/useSkyboxFromScene';

export type SceneContainerProps = {
  sdk: CogniteClient;
  sceneExternalId: string;
  sceneSpaceId: string;
  defaultResourceStyling?: DefaultResourceStyling;
  instanceStyling?: Array<FdmAssetStylingGroup | AssetMappingStylingGroup>;
  disableDefaultCamera: boolean;
  onResourcesAdded?: () => void;
  onResourceLoadError?: (error: any) => void;
};

export function SceneContainer({
  sceneExternalId,
  sceneSpaceId,
  sdk,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError
}: SceneContainerProps): ReactElement {
  const resourceOptions = useReveal3dResourcesFromScene(sceneExternalId, sceneSpaceId);

  useGroundPlaneFromScene(sdk, sceneExternalId, sceneSpaceId);
  useSkyboxFromScene(sdk, sceneExternalId, sceneSpaceId);

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
