import { useCallback, useEffect } from 'react';
import {
  Cognite3DModel,
  Cognite3DViewer,
  PointerEventDelegate,
  THREE,
} from '@cognite/reveal';
import {
  CAMERA_ANIMATION_DURATION,
  MINIMUM_BOUNDINGBOX_SIZE,
} from 'app/containers/ThreeD/utils';

type Args = {
  viewer?: Cognite3DViewer | null;
  model?: Cognite3DModel | null;
  nodesSelectable: boolean;
};

async function fitCameraToNode(
  model: Cognite3DModel,
  treeIndex: number,
  nodeId: number,
  ancestorLevel: number
): Promise<THREE.Box3> {
  const nodeBoundingBox = await model.getBoundingBoxByNodeId(nodeId);
  const size = new THREE.Vector3();
  nodeBoundingBox.getSize(size);
  const nodeBoundingBoxSize = size.x * size.y * size.z;
  ancestorLevel++;
  if (nodeBoundingBoxSize > MINIMUM_BOUNDINGBOX_SIZE || ancestorLevel > 5) {
    return nodeBoundingBox;
  } else {
    const parentRange = await model.getAncestorTreeIndices(treeIndex, 1);
    const parentNodeId = await model.mapTreeIndexToNodeId(parentRange.from);
    return fitCameraToNode(
      model,
      parentRange.toInclusive,
      parentNodeId,
      ancestorLevel
    );
  }
}

export function useViewerDoubleClickListener({
  viewer,
  model,
  nodesSelectable,
}: Args) {
  const viewerDoubleClickListener: PointerEventDelegate = useCallback(
    async ({ offsetX, offsetY }) => {
      if (!nodesSelectable || !viewer || !model) {
        return;
      }
      const intersection = await viewer.getIntersectionFromPixel(
        offsetX,
        offsetY
      );
      if (intersection && 'treeIndex' in intersection) {
        const { treeIndex } = intersection;
        model.mapTreeIndexToNodeId(treeIndex).then(async (nodeId: number) => {
          const boundingBox = await fitCameraToNode(
            model,
            treeIndex,
            nodeId,
            0
          );
          if (boundingBox) {
            boundingBox.union(boundingBox);
            viewer.fitCameraToBoundingBox(
              boundingBox,
              CAMERA_ANIMATION_DURATION,
              3
            );
          }
        });
      }
    },
    [nodesSelectable, viewer, model]
  );

  useEffect(() => {
    if (!viewer) {
      return;
    }
    viewer.domElement.addEventListener('dblclick', viewerDoubleClickListener);
    return () => {
      viewer.domElement.removeEventListener(
        'dblclick',
        viewerDoubleClickListener
      );
    };
  }, [viewer, viewerDoubleClickListener]);
}
