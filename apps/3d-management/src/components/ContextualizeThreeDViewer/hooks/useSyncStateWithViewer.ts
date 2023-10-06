import { useEffect, useRef } from 'react';

import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import { Cognite3DViewer, CognitePointCloudModel } from '@cognite/reveal';

import {
  ToolType,
  useContextualizeThreeDViewerStore,
} from '../useContextualizeThreeDViewerStore';
import { createAnnotationsAsWireframes } from '../utils/annotations/annotationUtils';
import { createTransformControls } from '../utils/createTransformControls';
import { getCognitePointCloudModel } from '../utils/getCognitePointCloudModel';
import { hideBoundingVolumes } from '../utils/hideBoundingVolumes';
import { showBoundingVolumes } from '../utils/showBoundingVolumes';
const PENDING_ANNOTATION_ID = 'pending-annotation';
const ANNOTATION_AS_WIREFRAME_ID = 'annotation-as-wireframe';

// Reveal should add a method that list all of the 3D objects in the scene.
// For now, I'm using this cache to keep track of the objects that is added to the scene.
let objectsInScene: THREE.Object3D[] = [];

const addObject = (viewer: Cognite3DViewer, object: THREE.Object3D) => {
  viewer.addObject3D(object);
  objectsInScene.push(object);
};

const removeObject = (viewer: Cognite3DViewer, object: THREE.Object3D) => {
  viewer.removeObject3D(object);
  objectsInScene = objectsInScene.filter((o) => o !== object);
};

const removeObjectByName = (viewer: Cognite3DViewer, name: string) => {
  objectsInScene
    .filter((object) => object.name === name)
    .forEach((object) => {
      removeObject(viewer, object);
    });
};

export const useSyncStateWithViewer = () => {
  const {
    modelId,
    isModelLoaded,
    pendingAnnotation,
    shouldShowBoundingVolumes,
    shouldShowWireframes,
    threeDViewer,
    tool,
    annotations,
    visualizationOptions,
  } = useContextualizeThreeDViewerStore((state) => ({
    modelId: state.modelId,
    isModelLoaded: state.isModelLoaded,
    pendingAnnotation: state.pendingAnnotation,
    shouldShowBoundingVolumes: state.shouldShowBoundingVolumes,
    shouldShowWireframes: state.shouldShowWireframes,
    threeDViewer: state.threeDViewer,
    tool: state.tool,
    annotations: state.annotations,
    visualizationOptions: state.visualizationOptions,
  }));
  const pendingAnnotationTransformControls = useRef<TransformControls | null>(
    null
  );

  useEffect(() => {
    if (threeDViewer === null) return;
    if (pendingAnnotationTransformControls.current === null) {
      pendingAnnotationTransformControls.current =
        createTransformControls(threeDViewer);
    }
  });

  // sync visualizationOptions with viewer
  useEffect(() => {
    if (threeDViewer === null) return;

    for (const model of threeDViewer.models)
      if (model instanceof CognitePointCloudModel) {
        model.pointSize = visualizationOptions.pointSize;
        model.pointColorType = visualizationOptions.pointColor;
      }
  }, [visualizationOptions, threeDViewer]);

  // Sync pending annotation with viewer.
  useEffect(() => {
    if (threeDViewer === null) return;

    const transformControls = pendingAnnotationTransformControls.current;
    if (transformControls === null) return;

    // Remove previous pending annotation(s) from the viewer.
    removeObjectByName(threeDViewer, PENDING_ANNOTATION_ID);

    // Add new pending annotation(s) to the viewer.
    if (pendingAnnotation === null) {
      transformControls.detach();
      return;
    }

    const newAnnotationCube = new THREE.Mesh(
      new THREE.BoxGeometry(
        pendingAnnotation.size.x,
        pendingAnnotation.size.y,
        pendingAnnotation.size.z
      ),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 0),
        transparent: true,
        opacity: 0.5,
      })
    );
    newAnnotationCube.name = PENDING_ANNOTATION_ID;

    const point = new THREE.Vector3(
      pendingAnnotation.position.x,
      pendingAnnotation.position.y,
      pendingAnnotation.position.z
    );

    newAnnotationCube.position.copy(point);
    addObject(threeDViewer, newAnnotationCube);

    transformControls.attach(newAnnotationCube);
    threeDViewer.addObject3D(transformControls);
  }, [pendingAnnotation, pendingAnnotationTransformControls, threeDViewer]);

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

    hideBoundingVolumes(threeDViewer, pointCloudModel);
  }, [shouldShowBoundingVolumes, threeDViewer, modelId, tool]);

  // Sync all annotation wireframes with viewer.
  useEffect(() => {
    if (threeDViewer === null) return;
    if (isModelLoaded === false) return;

    removeObjectByName(threeDViewer, ANNOTATION_AS_WIREFRAME_ID);

    if (!shouldShowWireframes || annotations === null || modelId === null)
      return;

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer: threeDViewer,
    });
    if (pointCloudModel === undefined) return;

    const group = createAnnotationsAsWireframes(
      annotations ?? [],
      pointCloudModel.getCdfToDefaultModelTransformation()
    );
    group.name = ANNOTATION_AS_WIREFRAME_ID;
    addObject(threeDViewer, group);
  }, [shouldShowWireframes, threeDViewer, annotations, modelId, isModelLoaded]);
};