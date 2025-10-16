import { useMemo } from 'react';
import { useSceneConfig } from './scenes/useSceneConfig';
import { Vector3, Quaternion, Euler, MathUtils, Matrix4 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type SceneConfiguration } from '../components/SceneContainer/sceneTypes';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import { use3dModels } from './use3dModels';

export const useSceneDefaultCamera = (
  sceneExternalId: string | undefined,
  sceneSpaceId: string | undefined
): { fitCameraToSceneDefault: () => void } | undefined => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const models = use3dModels();

  return useMemo(() => {
    if (scene === undefined) {
      return {
        fitCameraToSceneDefault: () => {
          viewer.fitCameraToModels(models, 0, true);
        }
      };
    }

    const cameraNotSet =
      scene.sceneConfiguration.cameraTranslationX === 0 &&
      scene.sceneConfiguration.cameraTranslationY === 0 &&
      scene.sceneConfiguration.cameraTranslationZ === 0 &&
      scene.sceneConfiguration.cameraEulerRotationX === 0 &&
      scene.sceneConfiguration.cameraEulerRotationY === 0 &&
      scene.sceneConfiguration.cameraEulerRotationZ === 0 &&
      scene.sceneConfiguration.cameraTargetX === undefined &&
      scene.sceneConfiguration.cameraTargetY === undefined &&
      scene.sceneConfiguration.cameraTargetZ === undefined;

    // Use a good default camera position if no camera configuration is provided
    if (cameraNotSet) {
      return {
        fitCameraToSceneDefault: () => {
          if (models.length === 0) {
            // If no models are loaded, set a default camera position
            // This is the same default position that have been used in SceneBuilder
            const position = new Vector3(-100, 200, 400);
            const target = new Vector3();
            viewer.cameraManager.setCameraState({ position, target });
          } else {
            viewer.fitCameraToModels(models, 0, true);
          }
        }
      };
    }

    const position = new Vector3(
      scene.sceneConfiguration.cameraTranslationX,
      scene.sceneConfiguration.cameraTranslationY,
      scene.sceneConfiguration.cameraTranslationZ
    );

    const target = extractCameraTarget(scene.sceneConfiguration);
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
          const quaternion = getLookAtRotation(position, target);
          viewer.cameraManager.setCameraState({ position, rotation: quaternion });
        }
      }
    };
  }, [viewer, scene, models]);
};

function extractCameraTarget(scene: SceneConfiguration): Vector3 {
  if (
    scene.cameraTargetX !== undefined ||
    scene.cameraTargetY !== undefined ||
    scene.cameraTargetZ !== undefined
  ) {
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

function getLookAtRotation(position: Vector3, target: Vector3): Quaternion {
  const direction = new Vector3().subVectors(position, target).normalize();
  const up = new Vector3(0, 1, 0);
  const right = new Vector3().crossVectors(up, direction).normalize();
  const recomputedUp = new Vector3().crossVectors(direction, right).normalize();
  const rotationMatrix = new Matrix4();
  rotationMatrix.makeBasis(right, recomputedUp, direction);
  return new Quaternion().setFromRotationMatrix(rotationMatrix);
}
