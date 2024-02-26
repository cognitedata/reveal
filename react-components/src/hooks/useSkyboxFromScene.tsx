/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { useReveal } from '..';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type Cognite3DViewer, CustomObject } from '@cognite/reveal';

export const useSkyboxFromScene = (sceneExternalId: string, sceneSpaceId: string): void => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const sdk = useSDK();

  const { data: skyboxTexture } = useQuery(
    ['reveal', 'react-components', 'skyboxUrl', scene.data],
    async () => {
      if (scene.data?.skybox === undefined) {
        return null;
      }

      const skyboxExternalId = scene.data.skybox.file;
      const skyBoxUrls = await sdk.files.getDownloadUrls([{ externalId: skyboxExternalId }]);

      if (skyBoxUrls.length === 0) {
        return null;
      }

      const skyboxUrl = skyBoxUrls[0].downloadUrl;
      return new THREE.TextureLoader().load(skyboxUrl);
    },
    { staleTime: Infinity }
  );

  useEffect(() => {
    if (skyboxTexture === undefined || skyboxTexture === null) {
      return;
    }
    const [skyboxMesh, cleanupFunction] = initializeSkybox(skyboxTexture, viewer);

    const customObject = new CustomObject(skyboxMesh);
    customObject.isPartOfBoundingBox = false;
    viewer.addCustomObject(customObject);

    return cleanupFunction;
  }, [skyboxTexture]);
};

function initializeSkybox(
  texture: THREE.Texture,
  viewer: Cognite3DViewer
): [THREE.Object3D, () => void] {
  const skyboxRadius = 10;
  const skyboxGeometry = new THREE.SphereGeometry(skyboxRadius, 20, 20);
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: texture
  });

  skyboxMaterial.depthWrite = false;
  const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  skyboxMesh.renderOrder = -2;
  skyboxMesh.frustumCulled = false;
  (skyboxMesh as any).boundingBox = new THREE.Box3().makeEmpty();

  const onBeforeRender = (
    _renderer: THREE.WebGLRenderer,
    _scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ): void => {
    skyboxMesh.position.copy(camera.position);
    skyboxMesh.updateMatrix();
    skyboxMesh.updateMatrixWorld(true);
    skyboxMesh.updateWorldMatrix(false, true);

    // Force low near-projection-plane to ensure the sphere geometry is in bounds
    (camera as any).lastNear = camera.near;
    (camera as any).lastFar = camera.far;
    camera.near = 0.1;
    camera.far = skyboxRadius + 0.1;
    camera.updateProjectionMatrix();
  };

  const onAfterRender = (
    _renderer: THREE.WebGLRenderer,
    _scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ): void => {
    camera.near = (camera as any).lastNear;
    camera.far = (camera as any).lastFar;
    camera.updateProjectionMatrix();
  };

  skyboxMesh.onBeforeRender = onBeforeRender;
  skyboxMesh.onAfterRender = onAfterRender;

  return [
    skyboxMesh,
    () => {
      // Cleanup function

      skyboxGeometry.dispose();
      texture.dispose();
      skyboxMesh.material.dispose();

      viewer.removeObject3D(skyboxMesh);
    }
  ];
}
