/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { useReveal } from '..';
import { type CogniteClient } from '@cognite/sdk';
import { useQuery } from '@tanstack/react-query';

export const useGroundPlaneFromScene = (
  sdk: CogniteClient,
  sceneExternalId: string,
  sceneSpaceId: string
): void => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const groundPlaneRef = useRef<Array<THREE.Object3D<THREE.Object3DEventMap>>>([]);

  const groundPlaneUrls = useQuery(
    ['reveal', 'react-components', 'groundplaneUrls', scene.data ?? ''],
    async () => {
      if (scene.data?.skybox === undefined || scene.data === null) {
        return [];
      }

      return await sdk.files.getDownloadUrls(
        scene.data.groundPlanes.map((groundPlaneProperties) => ({
          externalId: groundPlaneProperties.file
        }))
      );
    },
    { staleTime: Infinity }
  );

  useEffect(() => {
    if (
      scene.data === undefined ||
      groundPlaneUrls.data === undefined ||
      groundPlaneUrls.data.length === 0
    ) {
      return;
    }

    scene.data.groundPlanes.forEach((groundPlane, index) => {
      if (groundPlaneUrls.data === undefined) {
        return;
      }
      const textureUrl = groundPlaneUrls.data[index].downloadUrl;
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(textureUrl, function (texture) {
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const geometry = new THREE.PlaneGeometry(
          10000 * groundPlane.scaleX,
          10000 * groundPlane.scaleY
        );
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          groundPlane.translationX,
          groundPlane.translationY,
          groundPlane.translationZ
        );
        mesh.rotation.set(-Math.PI / 2, 0, 0);
        viewer.addObject3D(mesh);
        groundPlaneRef.current.push(mesh);
      });
    });

    return () => {
      // Cleanup function
      groundPlaneRef.current.forEach((groundPlane) => {
        viewer.removeObject3D(groundPlane);
      });
      groundPlaneRef.current.splice(0, groundPlaneRef.current.length);
    };
  }, [scene.data, groundPlaneUrls.data]);
};
