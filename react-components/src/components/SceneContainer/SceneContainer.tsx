/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement } from 'react';
import { Reveal3DResources } from '../..';
import type CogniteClient from '@cognite/sdk/dist/src/cogniteClient';
import {
  type AssetMappingStylingGroup,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../Reveal3DResources/types';
import { useSyncSceneConfigWithViewer } from '../../hooks/useSyncSceneConfigWithViewer';

export type CogniteSceneProps = {
  sdk: CogniteClient;
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
  sdk,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError
}: CogniteSceneProps): ReactElement {
  const resourceOptions = useSyncSceneConfigWithViewer({
    sdk,
    sceneExternalId: 'my_scene_external_id',
    sceneSpaceId: 'scene_space'
  });

  return (
    <>
      {
        <Reveal3DResources
          resources={resourceOptions}
          defaultResourceStyling={defaultResourceStyling}
          instanceStyling={instanceStyling}
          onResourceLoadError={onResourceLoadError}
        />
      }
    </>
  );
}
