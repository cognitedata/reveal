import { PointCloudIntersection, Intersection } from '@cognite/reveal';

// TODO: This is probably something that should be exported from reveal instead.
// Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2177
export const isPointCloudIntersection = (
  intersection: Intersection
): intersection is PointCloudIntersection => {
  return intersection.type === 'pointcloud';
};
