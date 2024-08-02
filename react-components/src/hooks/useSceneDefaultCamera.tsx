/*!
 * Copyright 2023 Cognite AS
 */

import { useMemo } from 'react';
import { useSceneConfig } from '../query/useSceneConfig';
import { Vector3, Quaternion, Euler, MathUtils, Box3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, type Cognite3DViewer } from '@cognite/reveal';
import { type SceneConfiguration } from '../components/SceneContainer/sceneTypes';
import { useReveal } from '../components/RevealCanvas/ViewerContext';

export const useSceneDefaultCamera = (
  sceneExternalId: string | undefined,
  sceneSpaceId: string | undefined
): { fitCameraToSceneDefault: () => void; isFetched: boolean } => {
  const { data } = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();

  return useMemo(() => {
    if (data === null) {
      return {
        fitCameraToSceneDefault: () => {
          viewer.fitCameraToModels(viewer.models);
        },
        isFetched: true
      };
    }
    if (data === undefined) {
      return {
        fitCameraToSceneDefault: () => {},
        isFetched: false
      };
    }

    const position = new Vector3(
      data.sceneConfiguration.cameraTranslationX,
      data.sceneConfiguration.cameraTranslationY,
      data.sceneConfiguration.cameraTranslationZ
    );

    const target = extractCameraTarget(data.sceneConfiguration, viewer);
    position.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    target.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    return {
      fitCameraToSceneDefault: () => {
        const initialCameraState = viewer.cameraManager.getCameraState();

        // Preserve pivot point if user has already set a pivot point
        // If not, set the pivot point near the center of the scene
        // When moving Scene to system space, we will extend the data
        // model to store pos, rot and pivot
        if (
          initialCameraState.target.x === 0 &&
          initialCameraState.target.y === 0 &&
          initialCameraState.target.z === 0
        ) {
          viewer.cameraManager.setCameraState({ position, target });
        } else {
          const direction = new Vector3().subVectors(position, target).normalize();
          const rotation = new Euler().setFromVector3(direction);
          const quaternion = new Quaternion().setFromEuler(rotation);

          viewer.cameraManager.setCameraState({ position, rotation: quaternion });
        }
      },
      isFetched: true
    };
  }, [viewer, data?.sceneConfiguration]);
};

function extractCameraTarget(scene: SceneConfiguration, viewer: Cognite3DViewer): Vector3 {
  if (scene.cameraTargetX !== undefined) {
    return new Vector3(scene.cameraTargetX, scene.cameraTargetY, scene.cameraTargetZ);
  } else {
    const rotation = new Quaternion().setFromEuler(
      new Euler(
        MathUtils.degToRad(scene.cameraEulerRotationX),
        MathUtils.degToRad(scene.cameraEulerRotationY),
        MathUtils.degToRad(scene.cameraEulerRotationZ),
        'XYZ'
      )
    );

    const position = new Vector3(
      scene.cameraTranslationX,
      scene.cameraTranslationY,
      scene.cameraTranslationZ
    );
    // As a heuristic, use distance to center of all models' bounding
    // boxes as target distance
    const positionToSceneCenterDistance = position.distanceTo(
      viewer.models
        .reduce((acc, m) => acc.union(m.getModelBoundingBox()), new Box3())
        .getCenter(new Vector3())
    );
    return position
      .clone()
      .add(new Vector3(0, 0, -positionToSceneCenterDistance).applyQuaternion(rotation));
  }
}
