/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { useSceneConfigQuery } from './useSceneConfigQuery';
import * as THREE from 'three';
import { useReveal } from '..';
import { type CogniteClient } from '@cognite/sdk/dist/src';

export const useSkyboxFromScene = (
  sdk: CogniteClient,
  sceneExternalId: string,
  sceneSpaceId: string
): void => {
  const scene = useSceneConfigQuery(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const skyboxRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();

  useEffect(() => {
    const loadSkybox = async (): Promise<void> => {
      if (scene.data === undefined || scene.data === null) {
        return;
      }

      if (scene.data.skybox !== undefined && scene.data.skybox !== null) {
        const skyboxExternalId = scene.data.skybox.file;
        const skyBoxUrls = await sdk.files.getDownloadUrls([{ externalId: skyboxExternalId }]);
        const skyboxUrl = skyBoxUrls[0].downloadUrl;

        const skyboxMesh = new THREE.Mesh(
          new THREE.SphereGeometry(9000000, 0, 0),
          new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: new THREE.TextureLoader().load(skyboxUrl)
          })
        );
        viewer.addObject3D(skyboxMesh);
        skyboxRef.current = skyboxMesh;
      }
    };
    void loadSkybox();

    return () => {
      // Cleanup function
      if (skyboxRef.current !== null && skyboxRef.current !== undefined) {
        viewer.removeObject3D(skyboxRef.current);
      }
      skyboxRef.current = undefined;
    };
  }, [scene.data]);
};
