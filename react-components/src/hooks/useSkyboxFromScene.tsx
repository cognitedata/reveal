/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef } from 'react';
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
    const skyboxGeometry = new THREE.SphereGeometry(10000000, 20, 20);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: skyboxTexture
    });

    const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

    // Center skybox around camera
    // skyboxMesh.position.set(
    //   scene.data?.sceneConfiguration.cameraTranslationX,
    //   scene.data?.sceneConfiguration.cameraTranslationY,
    //   scene.data?.sceneConfiguration.cameraTranslationZ
    // );

    viewer.on('cameraChange', (position, target) => {
      skyboxMesh.position.copy(target);
    });

    viewer.addObject3D(skyboxMesh);

    return () => {
      // Cleanup function

      skyboxGeometry.dispose();
      skyboxTexture.dispose();
      skyboxMesh.material.dispose();
      viewer.removeObject3D(skyboxMesh);
    };
  }, [skyboxTexture]);
};
