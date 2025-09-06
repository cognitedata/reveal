import { type AnyIntersection, type PointCloudIntersection } from '@cognite/reveal';

// Type guard for PointCloudIntersection
export function isPointCloudIntersection(
  intersection: AnyIntersection | undefined
): intersection is PointCloudIntersection {
  if (intersection?.type !== 'pointcloud') {
    return false;
  }
  return true;
}
