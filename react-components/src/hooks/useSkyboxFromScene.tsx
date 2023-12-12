/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { useReveal } from '..';
import { useQuery } from '@tanstack/react-query';
import { type CogniteClient } from '@cognite/sdk/dist/src';

export const useSkyboxFromScene = (
  sdk: CogniteClient,
  sceneExternalId: string,
  sceneSpaceId: string
): void => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const skyboxRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();

  const skyboxUrl = useQuery(
    ['reveal', 'react-components', 'skyboxUrl', scene.data],
    async () => {
      if (scene.data?.skybox === undefined || scene.data === null) {
        return '';
      }

      const skyboxExternalId = scene.data.skybox.file;
      const skyBoxUrls = await sdk.files.getDownloadUrls([{ externalId: skyboxExternalId }]);
      const skyboxUrl = skyBoxUrls[0].downloadUrl;
      return skyboxUrl;
    },
    { staleTime: Infinity }
  );

  useEffect(() => {
    const loadSkybox = async (): Promise<void> => {
      if (skyboxUrl.data === undefined || skyboxUrl.data === null) {
        return;
      }

      const skyboxMesh = new THREE.Mesh(
        new THREE.SphereGeometry(9000000, 0, 0),
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          map: new THREE.TextureLoader().load(skyboxUrl.data)
        })
      );
      viewer.addObject3D(skyboxMesh);
      skyboxRef.current = skyboxMesh;
    };
    void loadSkybox();

    return () => {
      // Cleanup function
      if (skyboxRef.current !== null && skyboxRef.current !== undefined) {
        viewer.removeObject3D(skyboxRef.current);
      }
      skyboxRef.current = undefined;
    };
  }, [skyboxUrl]);
};
