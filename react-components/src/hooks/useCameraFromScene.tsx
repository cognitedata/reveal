/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { useReveal } from '..';

export const useCameraFromScene = (sceneExternalId: string, sceneSpaceId: string): void => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();

  useEffect(() => {
    if (scene.data === undefined) {
      return;
    }

    const position = new THREE.Vector3(
      scene.data.sceneConfiguration.cameraTranslationX,
      scene.data.sceneConfiguration.cameraTranslationY,
      scene.data.sceneConfiguration.cameraTranslationZ
    );

    const euler = new THREE.Euler(
      scene.data.sceneConfiguration.cameraEulerRotationX,
      scene.data.sceneConfiguration.cameraEulerRotationY,
      scene.data.sceneConfiguration.cameraEulerRotationZ,
      'XYZ'
    );

    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    const vec = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
    vec.add(position);

    viewer.cameraManager.setCameraState({ position, target: vec });
  }, [scene.data]);
};
