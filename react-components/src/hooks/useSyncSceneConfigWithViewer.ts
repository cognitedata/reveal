/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { useSceneConfigQuery } from './useSceneConfigQuery';
import * as THREE from 'three';
import { type AddResourceOptions, useReveal } from '..';
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type AddImageCollection360DatamodelsOptions } from '../components/Reveal3DResources/types';
import { type AddModelOptions } from '@cognite/reveal';

export type UseSyncSceneConfigWithViewerProps = {
  sdk: CogniteClient;
  sceneExternalId: string;
  sceneSpaceId: string;
};

export const useSyncSceneConfigWithViewer = ({
  sdk,
  sceneExternalId,
  sceneSpaceId
}: UseSyncSceneConfigWithViewerProps): AddResourceOptions[] => {
  const scene = useSceneConfigQuery(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();

  const skyboxRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();
  const groundPlaneRef = useRef<Array<THREE.Object3D<THREE.Object3DEventMap>>>([]);

  useEffect(() => {
    return () => {
      // Cleanup function
      if (skyboxRef.current !== null && skyboxRef.current !== undefined) {
        viewer.removeObject3D(skyboxRef.current);
      }
      skyboxRef.current = undefined;

      if (groundPlaneRef.current !== null && groundPlaneRef.current !== undefined) {
        groundPlaneRef.current.forEach((groundPlane) => {
          viewer.removeObject3D(groundPlane);
        });
      }
      groundPlaneRef.current.splice(0, groundPlaneRef.current.length);
    };
  }, [scene]);

  useEffect(() => {
    const loadGroundPlaneAndSkybox = async (): Promise<void> => {
      if (scene.data === undefined || scene.data === null) {
        return;
      }

      // Add skybox
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
    void loadGroundPlaneAndSkybox();
  }, [scene]);

  const addResourceOptions: AddResourceOptions[] = [];
  if (scene.data !== undefined && scene.data !== null) {
    scene.data.sceneModels.forEach((model) => {
      if (isNaN(model.modelId)) {
        throw new Error('Model id is not a number');
      }

      const addModelOptions: AddModelOptions = {
        modelId: model.modelId,
        revisionId: model.revisionId
      };

      const transform = new THREE.Matrix4();
      const scale = new THREE.Matrix4().makeScale(model.scaleX, model.scaleY, model.scaleZ);
      const euler = new THREE.Euler(
        model.eulerRotationX,
        model.eulerRotationY,
        model.eulerRotationZ,
        'XYZ'
      );
      const rotation = new THREE.Matrix4().makeRotationFromEuler(euler);
      // Create translation matrix
      const translation = new THREE.Matrix4().makeTranslation(
        model.translationX,
        model.translationY,
        model.translationZ
      );

      // Combine transformations
      transform.multiply(scale).multiply(rotation).multiply(translation);
      addResourceOptions.push({ ...addModelOptions, transform });
    });

    scene.data.image360Collections.forEach((collection) => {
      const addModelOptions: AddImageCollection360DatamodelsOptions = {
        externalId: collection.image360CollectionExternalId,
        space: collection.image360CollectionSpace
      };

      const transform = new THREE.Matrix4();
      const scale = new THREE.Matrix4().makeScale(
        collection.scaleX,
        collection.scaleY,
        collection.scaleZ
      );
      const euler = new THREE.Euler(
        collection.eulerRotationX,
        collection.eulerRotationY,
        collection.eulerRotationZ,
        'XYZ'
      );
      const rotation = new THREE.Matrix4().makeRotationFromEuler(euler);
      // Create translation matrix
      const translation = new THREE.Matrix4().makeTranslation(
        collection.translationX,
        collection.translationY,
        collection.translationZ
      );

      // Combine transformations
      transform.multiply(scale).multiply(rotation).multiply(translation);
      addResourceOptions.push({ ...addModelOptions, transform });
    });
  }

  return addResourceOptions;
};
