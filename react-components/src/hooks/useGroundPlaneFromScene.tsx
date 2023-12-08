/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { useSceneConfigQuery } from './useSceneConfigQuery';
import * as THREE from 'three';
import { useReveal } from '..';
import { type CogniteClient } from '@cognite/sdk/dist/src';

export const useGroundPlaneFromScene = (
  sdk: CogniteClient,
  sceneExternalId: string,
  sceneSpaceId: string
): void => {
  const scene = useSceneConfigQuery(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const groundPlaneRef = useRef<Array<THREE.Object3D<THREE.Object3DEventMap>>>([]);

  useEffect(() => {
    const loadGroundPlane = async (): Promise<void> => {
      if (scene.data === undefined || scene.data === null) {
        return;
      }

      const groundPlaneTextureUrls = await sdk.files.getDownloadUrls(
        scene.data.groundPlanes.map((groundPlaneProperties) => ({
          externalId: groundPlaneProperties.file
        }))
      );

      let index = 0;
      scene.data.groundPlanes.forEach((groundPlane) => {
        const textureUrl = groundPlaneTextureUrls[index++].downloadUrl;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(textureUrl, function (texture) {
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const geometry = new THREE.PlaneGeometry(1000, 1000);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(
            groundPlane.translationX,
            groundPlane.translationY,
            groundPlane.translationZ
          );
          mesh.rotation.set(-Math.PI, 0, 0);
          viewer.addObject3D(mesh);
          groundPlaneRef.current.push(mesh);
        });
      });
    };
    void loadGroundPlane();

    return () => {
      // Cleanup function
      if (groundPlaneRef.current !== null && groundPlaneRef.current !== undefined) {
        groundPlaneRef.current.forEach((groundPlane) => {
          viewer.removeObject3D(groundPlane);
        });
      }
      groundPlaneRef.current.splice(0, groundPlaneRef.current.length);
    };
  }, [scene.data]);
};
