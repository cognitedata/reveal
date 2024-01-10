/*!
 * Copyright 2023 Cognite AS
 */

import { useMemo } from 'react';
import { useSceneConfig } from './useSceneConfig';
import { Vector3, Quaternion, Euler, MathUtils, Box3 } from 'three';
import { useReveal } from '..';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

export const useSceneDefaultCamera = (
  sceneExternalId: string,
  sceneSpaceId: string
): { fitCameraToSceneDefault: () => void } => {
  const { data } = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();

  return useMemo(() => {
    if (data === undefined) {
      return { fitCameraToSceneDefault: () => {} };
    }

    const position = new Vector3(
      data.sceneConfiguration.cameraTranslationX,
      data.sceneConfiguration.cameraTranslationY,
      data.sceneConfiguration.cameraTranslationZ
    );

    const rotation = new Quaternion().setFromEuler(
      new Euler(
        MathUtils.degToRad(data.sceneConfiguration.cameraEulerRotationX),
        MathUtils.degToRad(data.sceneConfiguration.cameraEulerRotationY),
        MathUtils.degToRad(data.sceneConfiguration.cameraEulerRotationZ),
        'XYZ'
      )
    );

    // As a heuristic, use distance to center of all models' bounding
    // boxes as target distance
    const positionToSceneCenterDistance = position.distanceTo(
      viewer.models
        .reduce((acc, m) => acc.union(m.getModelBoundingBox()), new Box3())
        .getCenter(new Vector3())
    );
    const target = position
      .clone()
      .add(new Vector3(0, 0, -positionToSceneCenterDistance).applyQuaternion(rotation));

    position.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    target.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    return {
      fitCameraToSceneDefault: () => {
        viewer.cameraManager.setCameraState({ position, target });
      }
    };
  }, [data, viewer]);
};
