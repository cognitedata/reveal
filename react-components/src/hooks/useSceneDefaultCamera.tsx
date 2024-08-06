/*!
 * Copyright 2023 Cognite AS
 */

import { useMemo } from 'react';
import { useSceneConfig } from '../query/useSceneConfig';
import { Vector3, Quaternion, Euler, MathUtils, Matrix4 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
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

    // Use a good default camera position if no camera configuration is provided
    if (
      data.sceneConfiguration.cameraTranslationX === 0 &&
      data.sceneConfiguration.cameraTranslationY === 0 &&
      data.sceneConfiguration.cameraTranslationZ === 0 &&
      data.sceneConfiguration.cameraEulerRotationX === 0 &&
      data.sceneConfiguration.cameraEulerRotationY === 0 &&
      data.sceneConfiguration.cameraEulerRotationZ === 0 &&
      data.sceneConfiguration.cameraTargetX === undefined &&
      data.sceneConfiguration.cameraTargetY === undefined &&
      data.sceneConfiguration.cameraTargetZ === undefined
    ) {
      return {
        fitCameraToSceneDefault: () => {
          if (viewer.models.length === 0) {
            const position = new Vector3(-100, 200, 400);
            const target = new Vector3();
            viewer.cameraManager.setCameraState({ position, target });
          } else {
            viewer.fitCameraToModels(viewer.models);
          }
        },
        isFetched: false
      };
    }

    const position = new Vector3(
      data.sceneConfiguration.cameraTranslationX,
      data.sceneConfiguration.cameraTranslationY,
      data.sceneConfiguration.cameraTranslationZ
    );

    const target = extractCameraTarget(data.sceneConfiguration);
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
          const up = new Vector3(0, 1, 0);
          const right = new Vector3().crossVectors(up, direction).normalize();
          const recomputedUp = new Vector3().crossVectors(direction, right).normalize();
          const rotationMatrix = new Matrix4();
          rotationMatrix.makeBasis(right, recomputedUp, direction);
          const quaternion = new Quaternion().setFromRotationMatrix(rotationMatrix);

          viewer.cameraManager.setCameraState({ position, rotation: quaternion });
        }
      },
      isFetched: true
    };
  }, [viewer, data?.sceneConfiguration]);
};

function extractCameraTarget(scene: SceneConfiguration): Vector3 {
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
    return position.clone().add(new Vector3(0, 0, -50).applyQuaternion(rotation));
  }
}
