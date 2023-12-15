/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { useReveal } from '..';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealContainer/SDKProvider';

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
    const skyboxGeometry = new THREE.SphereGeometry(1000000, 20, 20);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: skyboxTexture
    });

    const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

    const onCameraChange = (position: THREE.Vector3): void => {
      skyboxMesh.position.copy(position);
    };

    viewer.on('cameraChange', onCameraChange);

    viewer.addObject3D(skyboxMesh);

    return () => {
      // Cleanup function

      skyboxGeometry.dispose();
      skyboxTexture.dispose();
      skyboxMesh.material.dispose();

      viewer.removeObject3D(skyboxMesh);
      viewer.off('cameraChange', onCameraChange);
    };
  }, [skyboxTexture]);
};
