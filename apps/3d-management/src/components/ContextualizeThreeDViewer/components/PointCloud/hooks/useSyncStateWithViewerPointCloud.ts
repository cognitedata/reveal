import { useEffect, useRef } from 'react';

import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import { Cognite3DViewer, CognitePointCloudModel } from '@cognite/reveal';

import { ANNOTATION_RADIUS_FACTOR } from '../../../../../pages/ContextualizeEditor/constants';
import {
  ToolType,
  useContextualizeThreeDViewerStore,
  setPendingAnnotation,
  CubeAnnotation,
  resetContextualizeThreeDViewerStore,
} from '../../../useContextualizeThreeDViewerStore';
import { getAnnotationAsBox3 } from '../../../utils/annotations/getAnnotationAsBox3';
import { createTransformControls } from '../../../utils/createTransformControls';
import { getCognitePointCloudModel } from '../../../utils/getCognitePointCloudModel';
const HOVERING_ANNOTATION_ID = 'hovered-annotation';
const PENDING_ANNOTATION_ID = 'pending-annotation';

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

export const useSyncStateWithViewerPointCloud = () => {
  const {
    annotations,
    hoveredAnnotationId,
    modelId,
    pendingAnnotation,
    threeDViewer,
    tool,
    visualizationOptions,
    transformMode,
    selectedAnnotationId,
  } = useContextualizeThreeDViewerStore((state) => ({
    annotations: state.annotations,
    hoveredAnnotationId: state.hoveredAnnotationId,
    modelId: state.modelId,
    pendingAnnotation: state.pendingAnnotation,
    threeDViewer: state.threeDViewer,
    tool: state.tool,
    visualizationOptions: state.visualizationOptions,
    transformMode: state.transformMode,
    selectedAnnotationId: state.selectedAnnotationId,
  }));
  const useTransformControls = useRef<TransformControls | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetContextualizeThreeDViewerStore();
    };
  }, []);

  useEffect(() => {
    if (threeDViewer === null) return;
    if (useTransformControls.current === null) {
      useTransformControls.current = createTransformControls(threeDViewer);
    }
  });

  useEffect(() => {
    if (threeDViewer === null) return;

    const onClick = async (event) => {
      const intersection = await threeDViewer.getIntersectionFromPixel(
        event.offsetX,
        event.offsetY
      );
      if (
        intersection === null ||
        tool !== ToolType.ADD_ANNOTATION ||
        pendingAnnotation !== null
      ) {
        return;
      }
      const distance = threeDViewer.cameraManager
        .getCamera()
        .position.distanceTo(intersection.point);
      const CubeSize = distance * ANNOTATION_RADIUS_FACTOR;
      const cubeAnnotation: CubeAnnotation = {
        position: {
          x: intersection.point.x,
          y: intersection.point.y,
          z: intersection.point.z,
        },
        size: {
          x: CubeSize,
          y: CubeSize,
          z: CubeSize,
        },
      };
      setPendingAnnotation(cubeAnnotation);
    };
    threeDViewer.on('click', onClick);
    return () => {
      threeDViewer.off('click', onClick);
    };
  }, [threeDViewer, pendingAnnotation, tool]);

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
    const transformControls = useTransformControls.current;
    if (transformControls === null) return;
    if (transformMode === null) {
      transformControls.visible = false;
      transformControls.enabled = false;
      return;
    }

    transformControls.setMode(transformMode);
    transformControls.visible = true;
    transformControls.enabled = true;
  }, [threeDViewer, useTransformControls, transformMode]);

  // sync select tool with viewer
  useEffect(() => {
    if (threeDViewer === null) return;
    if (modelId === null) return;

    if (tool !== ToolType.SELECT_TOOL) {
      return;
    }
    if (selectedAnnotationId === null) {
      setPendingAnnotation(null);
      return;
    }
    const annotation = annotations?.find(
      (annotation) => annotation.id === selectedAnnotationId
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

    removeObjectByName(threeDViewer, PENDING_ANNOTATION_ID);

    const cubeAnnotation: CubeAnnotation = {
      position: box3.getCenter(new THREE.Vector3()),
      size: new THREE.Vector3(
        box3.max.x - box3.min.x,
        box3.max.y - box3.min.y,
        box3.max.z - box3.min.z
      ),
    };
    setPendingAnnotation(cubeAnnotation);
  }, [threeDViewer, tool, selectedAnnotationId, annotations, modelId]);

  // Sync pending annotation with viewer.
  useEffect(() => {
    if (threeDViewer === null) return;

    // Remove previous pending annotation(s) from the viewer.
    removeObjectByName(threeDViewer, PENDING_ANNOTATION_ID);

    if (tool !== ToolType.ADD_ANNOTATION && tool !== ToolType.SELECT_TOOL) {
      setPendingAnnotation(null);
      return;
    }

    // Add new pending annotation(s) to the viewer.
    if (pendingAnnotation === null) {
      useTransformControls.current?.detach();
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
    const transformControls = useTransformControls.current;
    if (transformControls === null) return;

    transformControls.attach(newAnnotationCube);
    if (transformMode === null) {
      transformControls.visible = false;
      transformControls.enabled = false;
    } else {
      transformControls.setMode(transformMode);
    }
    threeDViewer.addObject3D(transformControls);
  }, [
    pendingAnnotation,
    useTransformControls,
    threeDViewer,
    tool,
    transformMode,
  ]);

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
