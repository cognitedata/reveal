import { useCallback, useEffect } from 'react';

import { minBy } from 'lodash';
import { Matrix4, PerspectiveCamera, Ray, Vector2, Vector3 } from 'three';

import { PointerEventData } from '@cognite/reveal';
import { useReveal } from '@cognite/reveal-react-components';
import { AnnotationModel } from '@cognite/sdk';

import { useContextualizeThreeDViewerStore } from '../useContextualizeThreeDViewerStore';
import { intersectAnnotation } from '../utils/annotations/intersectAnnotation';
import { getCognitePointCloudModel } from '../utils/getCognitePointCloudModel';

export type IntersectedAnnotations = {
  annotationId: number;
  intersectionPoint: Vector3;
};

export type AnnotationIntersectedHandler = (
  intersectedAnnotation: IntersectedAnnotations[]
) => void;

export const useIntersectAnnotationVolumesOnClick = (
  onAnnotationIntersected: AnnotationIntersectedHandler,
  options?: { enabled: boolean }
) => {
  const { annotations, modelId } = useContextualizeThreeDViewerStore(
    (state) => ({
      annotations: state.annotations,
      modelId: state.modelId,
    })
  );

  const viewer = useReveal();

  const cdfToPointCloudTransformation =
    modelId !== null
      ? getCognitePointCloudModel({
          modelId,
          viewer,
        })?.getCdfToDefaultModelTransformation()
      : undefined;

  const handleClick = useCallback(
    (event: PointerEventData) => {
      if (annotations === null || cdfToPointCloudTransformation === undefined) {
        return;
      }

      const revealCamera = viewer.cameraManager.getCamera();
      const domElementClientSize = new Vector2(
        viewer.domElement.clientWidth,
        viewer.domElement.clientHeight
      );

      const ray = getRayFromCamera(event, revealCamera, domElementClientSize);

      const intersectedAnnotations = intersectAnnotations(
        annotations,
        cdfToPointCloudTransformation,
        ray
      );
      onAnnotationIntersected(intersectedAnnotations);
    },
    [
      annotations,
      cdfToPointCloudTransformation,
      onAnnotationIntersected,
      viewer,
    ]
  );

  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    viewer.on('click', handleClick);
    return () => {
      viewer.off('click', handleClick);
    };
  }, [enabled, handleClick, viewer]);
};

function intersectAnnotations(
  annotations: AnnotationModel[],
  cdfToPointCloudTransformation: Matrix4,
  ray: Ray
): IntersectedAnnotations[] {
  return annotations
    .map(getClosesAnnotationIntersection)
    .filter((intersection): intersection is IntersectedAnnotations => {
      return intersection !== null;
    })
    .sort(({ intersectionPoint: a }, { intersectionPoint: b }) => {
      return a.distanceToSquared(ray.origin) - b.distanceToSquared(ray.origin);
    });

  function getClosesAnnotationIntersection(annotation: AnnotationModel) {
    const intersectionPoints = intersectAnnotation(
      annotation,
      cdfToPointCloudTransformation!,
      ray
    );
    if (intersectionPoints === null || intersectionPoints.length === 0) {
      return null;
    }

    const intersectionPoint = minBy(intersectionPoints, (point) =>
      point.distanceToSquared(ray.origin)
    );

    if (intersectionPoint === undefined) {
      return null;
    }

    return {
      annotationId: annotation.id,
      intersectionPoint,
    };
  }
}

function getRayFromCamera(
  event: PointerEventData,
  camera: PerspectiveCamera,
  domElementClientSize: Vector2
): Ray {
  const ray = new Ray();

  const x = (event.offsetX / domElementClientSize.x) * 2 - 1;
  const y = -(event.offsetY / domElementClientSize.y) * 2 + 1;

  ray.origin.setFromMatrixPosition(camera.matrixWorld);
  ray.direction.set(x, y, 0.5).unproject(camera).sub(ray.origin).normalize();

  return ray;
}
