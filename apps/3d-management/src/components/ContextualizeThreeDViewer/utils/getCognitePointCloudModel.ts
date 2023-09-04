import {
  Cognite3DViewer,
  CogniteModel,
  CognitePointCloudModel,
} from '@cognite/reveal';

// Would it be better is this was exposed by Reveal?
// Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2177
const isCognitePointCloudModel = (
  model: CogniteModel
): model is CognitePointCloudModel => model instanceof CognitePointCloudModel;

export const getCognitePointCloudModel = ({
  modelId,
  viewer,
}: {
  modelId: number;
  viewer: Cognite3DViewer;
}): CognitePointCloudModel | undefined => {
  return viewer.models
    .filter(isCognitePointCloudModel)
    .find((model) => model.modelId === modelId);
};
