import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three';

import {
  Cognite3DViewer,
  CogniteCadModel,
  CognitePointCloudModel,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk/dist/src';

import { CubeAnnotation } from '../useContextualizeThreeDViewerStore';

import { createCdfThreeDAnnotation } from './createCdfThreeDAnnotation';

export const saveCdfThreeDPointCloudContextualization = ({
  sdk,
  viewer,
  model,
  modelId,
  assetId,
  pendingAnnotation,
}: {
  sdk: CogniteClient;
  viewer: Cognite3DViewer | null;
  model: CognitePointCloudModel | CogniteCadModel | undefined;
  modelId: number;
  assetId: number;
  pendingAnnotation: CubeAnnotation | null;
}) => {
  // TODO: All of these console.warn should be presented nicely to the user.
  // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2168
  if (
    viewer == null ||
    model == null ||
    !(model instanceof CognitePointCloudModel) ||
    pendingAnnotation == null
  ) {
    return;
  }
  const pointCloudModel = model;

  createCdfThreeDAnnotation({
    position: pendingAnnotation.position,
    sdk,
    modelId,
    assetRefId: assetId,
    pointCloudModel,
  });

  // TODO: This is just a temporary place to add the visualized saved annotations.
  //       We want to store the saved annotation in the same way we store the pending annotation in the useContextualizeThreeDViewerStore.
  //       In that way, it would be much easier to show all of the annotations in the viewer, not only the one created in the current session.
  // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2169
  const newSavedAnnotation = new Mesh(
    new BoxGeometry(2, 2, 2),
    new MeshBasicMaterial({
      color: new Color(0, 1, 0),
      transparent: true,
      opacity: 0.5,
    })
  );
  newSavedAnnotation.position.set(
    pendingAnnotation.position.x,
    pendingAnnotation.position.y,
    pendingAnnotation.position.z
  );
  viewer.addObject3D(newSavedAnnotation);
};
