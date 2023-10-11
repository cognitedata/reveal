import { useEffect, useRef } from 'react';

import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import { Cognite3DViewer, CognitePointCloudModel } from '@cognite/reveal';

import {
  ToolType,
  useContextualizeThreeDViewerStore,
} from '../useContextualizeThreeDViewerStore';
import { createAnnotationsAsWireframes } from '../utils/annotations/annotationUtils';
import { getAnnotationAsBox3 } from '../utils/annotations/getAnnotationAsBox3';
import { createTransformControls } from '../utils/createTransformControls';
import { getCognitePointCloudModel } from '../utils/getCognitePointCloudModel';
import { hideBoundingVolumes } from '../utils/hideBoundingVolumes';
import { showBoundingVolumes } from '../utils/showBoundingVolumes';

const HOVERING_ANNOTATION_ID = 'hovered-annotation';
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
    annotations,
    hoveredAnnotationId,
    isModelLoaded,
    modelId,
    pendingAnnotation,
    shouldShowBoundingVolumes,
    shouldShowWireframes,
    threeDViewer,
    tool,
    visualizationOptions,
    transformMode,
  } = useContextualizeThreeDViewerStore((state) => ({
    annotations: state.annotations,
    hoveredAnnotationId: state.hoveredAnnotationId,
    isModelLoaded: state.isModelLoaded,
    modelId: state.modelId,
    pendingAnnotation: state.pendingAnnotation,
    shouldShowBoundingVolumes: state.shouldShowBoundingVolumes,
    shouldShowWireframes: state.shouldShowWireframes,
    threeDViewer: state.threeDViewer,
    tool: state.tool,
    visualizationOptions: state.visualizationOptions,
    transformMode: state.transformMode,
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

  // sync transformControls with state
  useEffect(() => {
    if (threeDViewer === null) return;
    const transformControls = pendingAnnotationTransformControls.current;
    if (transformControls === null) return;
    if (transformMode === null) {
      transformControls.visible = false;
      transformControls.enabled = false;
      return;
    }
    transformControls.setMode(transformMode);
    transformControls.visible = true;
    transformControls.enabled = true;
  }, [threeDViewer, pendingAnnotationTransformControls, transformMode]);

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
      threeDViewer,
      annotations ?? [],
      pointCloudModel.getCdfToDefaultModelTransformation()
    );
    group.name = ANNOTATION_AS_WIREFRAME_ID;
    addObject(threeDViewer, group);
  }, [shouldShowWireframes, threeDViewer, annotations, modelId, isModelLoaded]);

  // Sync hovered annotation with viewer.
  useEffect(() => {
    if (threeDViewer === null) return;
    if (modelId === null) return;

    // Remove previous hovered annotation(s) from the viewer.
    removeObjectByName(threeDViewer, 'hovered-annotation');

    // Add new hovered annotation(s) to the viewer.
    const annotation = annotations?.find(
      (annotation) => annotation.id === hoveredAnnotationId
    );
    if (annotation === undefined) return;

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer: threeDViewer,
    });
    if (pointCloudModel === undefined) return;

    const matrix4 = pointCloudModel.getCdfToDefaultModelTransformation();
    const box3 = getAnnotationAsBox3(annotation, matrix4);
    if (box3 === undefined) return;

    // Semi transparent filled THREE box that will be visible regardless of the camera position
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(
        box3.max.x - box3.min.x,
        box3.max.y - box3.min.y,
        box3.max.z - box3.min.z
      ),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 0),
        transparent: true,
        opacity: 0.5,
        depthTest: false,
      })
    );

    // TODO: This representation of the box doesn't take into account the rotation of the box.
    // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2262
    box.position.copy(box3.getCenter(new THREE.Vector3()));

    box.name = HOVERING_ANNOTATION_ID;

    addObject(threeDViewer, box);
  }, [threeDViewer, annotations, modelId, hoveredAnnotationId]);
};
