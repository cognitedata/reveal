import type { Cognite3DViewer } from '@cognite/reveal';
import type { Legacy3DViewer } from 'src/pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';

export function isOldViewer(viewer: Cognite3DViewer | Legacy3DViewer): boolean {
  return !('addPointCloudModel' in viewer);
}
