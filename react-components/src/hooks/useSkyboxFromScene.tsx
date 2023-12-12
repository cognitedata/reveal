/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { useReveal } from '..';
import { useQuery } from '@tanstack/react-query';
import { type CogniteClient } from '@cognite/sdk';

export const useSkyboxFromScene = (
  sdk: CogniteClient,
  sceneExternalId: string,
  sceneSpaceId: string
): void => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const skyboxRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();

  const skybox = useQuery(
    ['reveal', 'react-components', 'skyboxUrl', scene.data],
    async () => {
      if (scene.data?.skybox === undefined || scene.data === null) {
        return null;
      }

      const skyboxExternalId = scene.data.skybox.file;
      const skyBoxUrls = await sdk.files.getDownloadUrls([{ externalId: skyboxExternalId }]);
      const skyboxUrl = skyBoxUrls[0].downloadUrl;
      return new THREE.TextureLoader().load(skyboxUrl);
    },
    { staleTime: Infinity }
  );

  useEffect(() => {
    if (skybox.data === undefined || skybox.data === null) {
      return;
    }

    const skyboxMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1000000, 20, 20),
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: skybox.data
      })
    );

    viewer.addObject3D(skyboxMesh);
    skyboxRef.current = skyboxMesh;

    return () => {
      // Cleanup function
      if (skyboxRef.current !== null && skyboxRef.current !== undefined) {
        viewer.removeObject3D(skyboxRef.current);
      }
      skyboxRef.current = undefined;
    };
  }, [skybox.data]);
};
