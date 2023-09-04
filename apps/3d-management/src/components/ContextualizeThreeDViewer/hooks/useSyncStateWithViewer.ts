import { useEffect } from 'react';

import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Vector3 } from 'three';

import { Cognite3DViewer } from '@cognite/reveal';

import {
  ToolType,
  useContextualizeThreeDViewerStore,
} from '../useContextualizeThreeDViewerStore';
import { getCognitePointCloudModel } from '../utils/getCognitePointCloudModel';
import { hideBoundingVolumes } from '../utils/hideBoundingVolumes';
import { showBoundingVolumes } from '../utils/showBoundingVolumes';

const PENDING_ANNOTATION_ID = 'pending-annotation';

// Reveal should add a method that list all of the 3D objects in the scene.
// For now, I'm using this cache to keep track of the objects that is added to the scene.
let objectsInScene: Mesh[] = [];

const removeObject = (viewer: Cognite3DViewer, object: Mesh) => {
  viewer.removeObject3D(object);
  objectsInScene = objectsInScene.filter((o) => o !== object);
};

const addObject = (viewer: Cognite3DViewer, object: Mesh) => {
  viewer.addObject3D(object);
  objectsInScene.push(object);
};

export const useSyncStateWithViewer = () => {
  const {
    modelId,
    pendingAnnotation,
    shouldShowBoundingVolumes,
    threeDViewer,
    tool,
  } = useContextualizeThreeDViewerStore((state) => ({
    modelId: state.modelId,
    pendingAnnotation: state.pendingAnnotation,
    shouldShowBoundingVolumes: state.shouldShowBoundingVolumes,
    threeDViewer: state.threeDViewer,
    tool: state.tool,
  }));

  // Sync pending annotation with viewer.
  useEffect(() => {
    if (threeDViewer === null) return;

    // Remove previous pending annotation(s) from the viewer.
    objectsInScene
      .filter((object) => object.name === PENDING_ANNOTATION_ID)
      .forEach((object) => {
        removeObject(threeDViewer, object);
      });

    // Add new pending annotation(s) to the viewer.
    if (pendingAnnotation === null) return;

    const newAnnotationCube = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial({
        color: new Color(1, 1, 0),
        transparent: true,
        opacity: 0.5,
      })
    );
    newAnnotationCube.name = PENDING_ANNOTATION_ID;

    const point = new Vector3(
      pendingAnnotation.position.x,
      pendingAnnotation.position.y,
      pendingAnnotation.position.z
    );
    newAnnotationCube.position.copy(point);
    addObject(threeDViewer, newAnnotationCube);
  }, [pendingAnnotation, threeDViewer]);

  // Sync annotation points with viewer.
  useEffect(() => {
    if (threeDViewer === null) return;
    if (modelId === null) return;

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer: threeDViewer,
    });
    if (pointCloudModel === undefined) return;

    if (shouldShowBoundingVolumes || tool === ToolType.DELETE_ANNOTATION) {
      showBoundingVolumes(pointCloudModel);
      return;
    }

    hideBoundingVolumes(pointCloudModel);
  }, [shouldShowBoundingVolumes, threeDViewer, modelId, tool]);
};
