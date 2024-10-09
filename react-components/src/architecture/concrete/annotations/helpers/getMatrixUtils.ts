/*!
 * Copyright 2024 Cognite AS
 */

import { CognitePointCloudModel, type Cognite3DViewer } from '@cognite/reveal';

import { type Matrix4 } from 'three';

export const getGlobalMatrix = (args: {
  modelId: number;
  viewer: Cognite3DViewer;
}): Matrix4 | null => {
  const pointCloudModel = getCognitePointCloudModel(args.modelId, args.viewer);
  if (pointCloudModel === undefined) {
    return null;
  }
  return pointCloudModel.getCdfToDefaultModelTransformation();
};

function getCognitePointCloudModel(
  modelId: number,
  viewer: Cognite3DViewer
): CognitePointCloudModel | undefined {
  return viewer.models
    .filter((model) => model instanceof CognitePointCloudModel)
    .find((model) => model instanceof CognitePointCloudModel && model.modelId === modelId);
}
