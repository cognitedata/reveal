/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useSceneConfig } from '../query/useSceneConfig';
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  type Texture,
  TextureLoader
} from 'three';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { CDF_TO_VIEWER_TRANSFORMATION, CustomObject } from '@cognite/reveal';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import { clear } from '../architecture/base/utilities/extensions/arrayExtensions';
import { transformation3dToMatrix4 } from '../utilities/transformation3dToMatrix4';

export const useGroundPlaneFromScene = (sceneExternalId: string, sceneSpaceId: string): void => {
  const { data: scene } = useSceneConfig(sceneExternalId, sceneSpaceId);
  const sdk = useSDK();
  const viewer = useReveal();

  const { data: groundPlaneTextures } = useQuery({
    queryKey: ['reveal', 'react-components', 'groundplaneUrls', scene ?? 'noSceneData'],
    queryFn: async () => {
      if (scene?.groundPlanes === undefined || scene.groundPlanes.length === 0) {
        return [];
      }

      const downloadUrls = await sdk.files.getDownloadUrls(
        scene.groundPlanes.map((groundPlaneProperties) => ({
          externalId: groundPlaneProperties.file
        }))
      );

      return await Promise.all(
        downloadUrls.map(async (url, index) => {
          let texture: Texture | undefined;
          const errorMessage = 'Failed to load groundplane texture';
          try {
            texture = await new TextureLoader().loadAsync(url.downloadUrl);
          } catch (error) {
            console.error(errorMessage);
            return undefined;
          }
          if (texture === null) {
            console.error(errorMessage);
            return undefined;
          }
          if (scene.groundPlanes[index].wrapping === 'repeat') {
            const repeatU = scene.groundPlanes[index].repeatU;
            const repeatV = scene.groundPlanes[index].repeatV;
            texture.repeat.set(repeatU, repeatV);
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
          }

          return texture;
        })
      );
    },
    staleTime: Infinity
  });

  useEffect(() => {
    if (
      scene === undefined ||
      scene === null ||
      groundPlaneTextures === undefined ||
      groundPlaneTextures.length === 0
    ) {
      return;
    }
    const groundMeshes: CustomObject[] = [];

    scene.groundPlanes.forEach((groundPlane, index) => {
      if (groundPlaneTextures?.[index] === undefined) {
        return;
      }
      const texture = groundPlaneTextures[index];
      const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
      const geometry = new PlaneGeometry(10000, 10000);

      geometry.name = `CogniteGroundPlane`;

      const mesh = new Mesh(geometry, material);

      const matrix4 = transformation3dToMatrix4(groundPlane).multiply(CDF_TO_VIEWER_TRANSFORMATION);
      mesh.matrix.copy(matrix4);
      mesh.matrixAutoUpdate = false;

      const customObject = new CustomObject(mesh);
      customObject.isPartOfBoundingBox = false;
      customObject.shouldPick = true;
      viewer.addCustomObject(customObject);

      groundMeshes.push(customObject);
    });

    return () => {
      // Cleanup function
      groundMeshes.forEach((customObject) => {
        const groundPlane = customObject.object as Mesh;
        groundPlane.geometry.dispose();

        const material = groundPlane.material as MeshBasicMaterial;
        material.map?.dispose();
        material.dispose();

        viewer.removeCustomObject(customObject);
      });

      clear(groundMeshes);
    };
  }, [groundPlaneTextures]);
};
