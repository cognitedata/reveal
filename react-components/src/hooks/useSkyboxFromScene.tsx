/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useSceneConfig } from './scenes/useSceneConfig';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type Cognite3DViewer, CustomObject, type DataSourceType } from '@cognite/reveal';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import {
  TextureLoader,
  type Texture,
  type Object3D,
  SphereGeometry,
  MeshBasicMaterial,
  BackSide,
  Mesh,
  Box3,
  type WebGLRenderer,
  type Scene,
  type PerspectiveCamera
} from 'three';

export const useSkyboxFromScene = (sceneExternalId: string, sceneSpaceId: string): void => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const sdk = useSDK();

  const { data: skyboxTexture } = useQuery({
    queryKey: ['reveal', 'react-components', 'skyboxUrl', scene.data],
    queryFn: async () => {
      if (scene.data?.skybox === undefined) {
        return null;
      }

      const skyboxExternalId = scene.data.skybox.file;
      const skyBoxUrls = await sdk.files.getDownloadUrls([{ externalId: skyboxExternalId }]);

      if (skyBoxUrls.length === 0) {
        return null;
      }

      const skyboxUrl = skyBoxUrls[0].downloadUrl;
      try {
        const texture = await new TextureLoader().loadAsync(skyboxUrl);
        return texture;
      } catch (error) {
        console.error('Failed to load skybox texture');
        return null;
      }
    },
    staleTime: Infinity
  });

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
  texture: Texture,
  viewer: Cognite3DViewer<DataSourceType>
): [Object3D, () => void] {
  const skyboxRadius = 10;
  const skyboxGeometry = new SphereGeometry(skyboxRadius, 20, 20);
  const skyboxMaterial = new MeshBasicMaterial({
    side: BackSide,
    map: texture
  });

  skyboxMaterial.depthWrite = false;
  const skyboxMesh = new Mesh(skyboxGeometry, skyboxMaterial);
  skyboxMesh.renderOrder = -2;
  skyboxMesh.frustumCulled = false;
  (skyboxMesh as any).boundingBox = new Box3().makeEmpty();

  const onBeforeRender = (
    _renderer: WebGLRenderer,
    _scene: Scene,
    camera: PerspectiveCamera
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
    _renderer: WebGLRenderer,
    _scene: Scene,
    camera: PerspectiveCamera
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
