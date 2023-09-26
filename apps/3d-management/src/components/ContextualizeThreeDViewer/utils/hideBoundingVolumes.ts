import { Cognite3DViewer, CognitePointCloudModel } from '@cognite/reveal';

export const hideBoundingVolumes = (
  viewer: Cognite3DViewer,
  pointCloudModel: CognitePointCloudModel
) => {
  // TODO: There seems to be a bug in Reveal, so you have to pan the camera before the bounding volumes are hidden.
  // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2178
  pointCloudModel.removeAllStyledObjectCollections();

  // This should not be necessary, but Reveal doesn't do this for us.
  viewer.requestRedraw();
};
