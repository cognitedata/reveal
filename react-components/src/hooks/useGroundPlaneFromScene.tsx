import { useContext, useEffect } from 'react';
import {
  DoubleSide,
  Euler,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  type Texture,
  TextureLoader
} from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, CustomObject } from '@cognite/reveal';
import { useQuery } from '@tanstack/react-query';
import { clear } from '../architecture/base/utilities/extensions/arrayUtils';
import { GroundPlaneFromSceneContext } from './useGroundPlaneFromScene.context';

export const useGroundPlaneFromScene = (sceneExternalId: string, sceneSpaceId: string): void => {
  const { useSceneConfig, useSDK, useReveal } = useContext(GroundPlaneFromSceneContext);

  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
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
    const groundPlaneScaleFactor = 10000;
    const groundMeshes: CustomObject[] = [];

    // New scale format was introduced as a bug in the Scenebuilder
    // on August 1st, 2024. This is a temporary fix to handle both formats.
    // This should be removed when we upgrade the Scene Data Model to a new version
    const useNewScaleFormat = groundPlaneUsesNewScaleFormat(scene.sceneConfiguration.updatedAt);

    scene.groundPlanes.forEach((groundPlane, index) => {
      if (groundPlaneTextures?.[index] === undefined) {
        return;
      }
      const texture = groundPlaneTextures[index];
      const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });

      const scaleX = groundPlane.scaleX;
      const scaleY = useNewScaleFormat ? groundPlane.scaleZ : groundPlane.scaleY;

      const geometry = new PlaneGeometry(
        groundPlaneScaleFactor * scaleX,
        groundPlaneScaleFactor * scaleY
      );

      geometry.name = `CogniteGroundPlane`;

      const mesh = new Mesh(geometry, material);
      mesh.position.set(
        groundPlane.translationX,
        groundPlane.translationY,
        groundPlane.translationZ
      );

      mesh.rotation.setFromRotationMatrix(
        transformRotationToViewerMatrix(
          groundPlane.eulerRotationX,
          groundPlane.eulerRotationY,
          groundPlane.eulerRotationZ
        )
      );

      mesh.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

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

  function groundPlaneUsesNewScaleFormat(lastUpdatedAt: string | undefined): boolean {
    if (lastUpdatedAt === undefined) {
      return false;
    }

    const dateModified = new Date(lastUpdatedAt);

    const groundPlaneScaleFormatChangedDate = new Date('2024-08-01T10:44:00.000Z');

    return dateModified > groundPlaneScaleFormatChangedDate;
  }

  function transformRotationToViewerMatrix(
    rotationX: number,
    rotationY: number,
    rotationZ: number
  ): Matrix4 {
    const euler = new Euler(
      MathUtils.degToRad(positiveModulus(rotationX - 90, 360)),
      MathUtils.degToRad(rotationY),
      MathUtils.degToRad(rotationZ),
      'XYZ'
    );

    return new Matrix4()
      .makeRotationFromEuler(euler)
      .premultiply(CDF_TO_VIEWER_TRANSFORMATION.clone().invert())
      .multiply(CDF_TO_VIEWER_TRANSFORMATION);
  }

  function positiveModulus(value: number, modulus: number): number {
    return ((value % modulus) + modulus) % modulus;
  }
};
