import { useCallback, useEffect } from 'react';
import * as THREE from 'three';
import {
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  PointerEventDelegate,
} from '@cognite/reveal';
import {
  CAMERA_ANIMATION_DURATION,
  MINIMUM_BOUNDINGBOX_SIZE,
} from 'app/containers/ThreeD/utils';

type Args = {
  viewer?: Cognite3DViewer;
  nodesSelectable: boolean;
};

async function fitCameraToNode(
  model: CogniteCadModel,
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

function getBoundingBoxAroundCamera(
  viewer: Cognite3DViewer,
  distanceFromCamera: number
): THREE.Box3 {
  const cameraPos = viewer.cameraManager.getCamera().position;
  const camera = viewer.cameraManager.getCamera();
  const vFOV = THREE.MathUtils.degToRad(camera.fov);
  const boundingBoxHeight = 2 * Math.tan(vFOV / 2) * distanceFromCamera;
  const boundingBoxWidth = boundingBoxHeight * camera.aspect;
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  const boundBoxAroundCamera = new THREE.Box3();
  boundBoxAroundCamera.setFromCenterAndSize(
    new THREE.Vector3(
      cameraPos.x + cameraDirection.x,
      cameraPos.y + cameraDirection.y,
      cameraPos.z + cameraDirection.z
    ),
    new THREE.Vector3(boundingBoxWidth, boundingBoxHeight, distanceFromCamera)
  );
  return boundBoxAroundCamera;
}

function getBoundingBoxAtPoint(point: THREE.Vector3): THREE.Box3 {
  const intersectPointBoundingBox = new THREE.Box3();
  intersectPointBoundingBox.setFromCenterAndSize(
    point,
    new THREE.Vector3(1, 1, 1)
  );
  return intersectPointBoundingBox;
}

export function useViewerDoubleClickListener({
  viewer,
  nodesSelectable,
}: Args) {
  const viewerDoubleClickListener: PointerEventDelegate = useCallback(
    async ({ offsetX, offsetY }) => {
      if (!nodesSelectable || !viewer) {
        return;
      }
      const intersection = await viewer.getIntersectionFromPixel(
        offsetX,
        offsetY
      );
      if (intersection) {
        const model = intersection.model;
        if (model instanceof CogniteCadModel && 'treeIndex' in intersection) {
          const { treeIndex } = intersection;
          model.mapTreeIndexToNodeId(treeIndex).then(async (nodeId: number) => {
            const nodeBoundingBox = await fitCameraToNode(
              model,
              treeIndex,
              nodeId,
              0
            );
            const size = new THREE.Vector3();
            nodeBoundingBox.getSize(size);
            const boundBoxAroundCamera = getBoundingBoxAroundCamera(
              viewer,
              Math.abs(size.z)
            );
            if (boundBoxAroundCamera.containsBox(nodeBoundingBox)) {
              nodeBoundingBox.union(nodeBoundingBox);
              viewer.fitCameraToBoundingBox(
                nodeBoundingBox,
                CAMERA_ANIMATION_DURATION,
                3
              );
            } else {
              const intersectPointBoundingBox = getBoundingBoxAtPoint(
                intersection.point
              );
              if (intersectPointBoundingBox.intersectsBox(nodeBoundingBox)) {
                viewer.fitCameraToBoundingBox(
                  intersectPointBoundingBox,
                  CAMERA_ANIMATION_DURATION,
                  3
                );
              }
            }
          });
        } else if (model instanceof CognitePointCloudModel) {
          const boundingBox = getBoundingBoxAtPoint(intersection.point);
          viewer.fitCameraToBoundingBox(
            boundingBox,
            CAMERA_ANIMATION_DURATION,
            3
          );
        }
      }
    },
    [nodesSelectable, viewer]
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
