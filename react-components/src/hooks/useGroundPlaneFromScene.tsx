/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useSceneConfig } from '../query/useSceneConfig';
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader } from 'three';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { CDF_TO_VIEWER_TRANSFORMATION, CustomObject } from '@cognite/reveal';
import { useReveal } from '../components/RevealCanvas/ViewerContext';

export const useGroundPlaneFromScene = (sceneExternalId: string, sceneSpaceId: string): void => {
  const { data: scene } = useSceneConfig(sceneExternalId, sceneSpaceId);
  const sdk = useSDK();
  const viewer = useReveal();

  const { data: groundPlanesUrls } = useQuery(
    ['reveal', 'react-components', 'groundplaneUrls', scene ?? 'noSceneData'],
    async () => {
      if (scene?.groundPlanes === undefined || scene.groundPlanes.length === 0) {
        return [];
      }

      const downloadUrls = await sdk.files.getDownloadUrls(
        scene.groundPlanes.map(groundPlaneProperties => ({
          externalId: groundPlaneProperties.file
        }))
      );

      return downloadUrls.map(url => {
        return new TextureLoader().load(url.downloadUrl);
      });
    },
    { staleTime: Infinity }
  );

  useEffect(() => {
    if (scene === undefined || scene === null || groundPlanesUrls === undefined || groundPlanesUrls.length === 0) {
      return;
    }
    const groundMeshes: CustomObject[] = [];

    scene.groundPlanes.forEach((groundPlane, index) => {
      if (groundPlanesUrls === undefined) {
        return;
      }
      const texture = groundPlanesUrls[index];
      const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
      const geometry = new PlaneGeometry(10000 * groundPlane.scaleX, 10000 * groundPlane.scaleY);

      geometry.name = `CogniteGroundPlane`;

      const mesh = new Mesh(geometry, material);
      mesh.position.set(groundPlane.translationX, groundPlane.translationY, groundPlane.translationZ);
      mesh.rotation.set(-Math.PI / 2, 0, 0);

      mesh.position.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      const customObject = new CustomObject(mesh);
      customObject.isPartOfBoundingBox = false;
      customObject.shouldPick = true;
      viewer.addCustomObject(customObject);

      groundMeshes.push(customObject);
    });

    return () => {
      // Cleanup function
      groundMeshes.forEach(customObject => {
        const groundPlane = customObject.object as Mesh;
        groundPlane.geometry.dispose();

        const material = groundPlane.material as MeshBasicMaterial;
        material.map?.dispose();
        material.dispose();

        viewer.removeCustomObject(customObject);
      });

      groundMeshes.splice(0, groundMeshes.length);
    };
  }, [groundPlanesUrls]);
};
