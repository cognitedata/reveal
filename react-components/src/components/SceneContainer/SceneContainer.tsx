/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { type CogniteModel, type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { Matrix4 } from 'three';
import * as THREE from 'three';
import { useReveal3DResourcesCount } from '../Reveal3DResources/Reveal3DResourcesCountContext';
import { type Query } from '../../utilities/FdmSDK';
import { useFdmSdk } from '../RevealContainer/SDKProvider';
import { createGetSceneQuery } from './Queries';
import {
  type GroundPlaneProperties,
  type SceneResponse,
  type SkyboxProperties
} from './SceneFdmTypes';

export type CogniteSceneProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
};

export function SceneContainer({ sceneExternalId, sceneSpaceId }: CogniteSceneProps): ReactElement {
  const viewer = useReveal();
  const fdmSdk = useFdmSdk();
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const skyboxRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();
  const groundPlaneRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();
  const cadModelsRef = useRef<CogniteModel[]>([]);

  useEffect(() => {
    return () => {
      void (async () => {})();
    };
  }, [skyboxRef, groundPlaneRef]);

  useEffect(() => {
    const loadScene = async (query: Query): Promise<void> => {
      // FDM query for scene
      const res = await fdmSdk.queryNodesAndEdges({
        ...query
      });

      const scene = res as any as SceneResponse;

      const sceneConfiguration = scene.items.scene[0];
      const sceneProps = sceneConfiguration.properties;
      const sceneConfigurationKey = Object.keys(sceneProps)[0]; // Get the first key
      const sceneConfigurationTypeKey = Object.keys(sceneProps[sceneConfigurationKey])[0];
      const SceneConfigurationProperties =
        sceneProps[sceneConfigurationKey][sceneConfigurationTypeKey];
      console.log(SceneConfigurationProperties);

      const hasGroundPlanes = scene.items.groundPlanes.length > 0;
      const groundPlanesProperties: GroundPlaneProperties[] = [];
      if (hasGroundPlanes) {
        const groundPlanes = scene.items.groundPlanes;
        groundPlanes.forEach((groundPlane) => {
          const groundPlaneProps = groundPlane.properties;
          const groundPlaneKey = Object.keys(groundPlaneProps)[0]; // Get the first key
          const groundPlaneTypeKey = Object.keys(groundPlaneProps[groundPlaneKey])[0];
          const groundPlaneProperties = groundPlaneProps[groundPlaneKey][groundPlaneTypeKey];
          groundPlanesProperties.push(groundPlaneProperties);
        });
      }

      groundPlanesProperties.forEach((groundPlaneProperties) => {
        console.log(groundPlaneProperties);
      });

      // Unpack skybox
      const hasSkybox = scene.items.skybox.length > 0;
      let skyboxProperties: SkyboxProperties;
      if (hasSkybox) {
        const skybox = scene.items.skybox[0];
        const skyboxProps = skybox.properties;
        const skyboxKey = Object.keys(skyboxProps)[0]; // Get the first key
        const skyboxTypeKey = Object.keys(skyboxProps[skyboxKey])[0];
        skyboxProperties = skyboxProps[skyboxKey][skyboxTypeKey];
        console.log(skyboxProperties);
      }

      // Skybox
      const skyboxUrl = '';
      const skyboxMesh = new THREE.Mesh(
        new THREE.SphereGeometry(300000, 0, 0),
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          map: new THREE.TextureLoader().load(skyboxUrl)
        })
      );
      viewer.addObject3D(skyboxMesh);
      skyboxRef.current = skyboxMesh;

      // Camera translation and rotation
      {
        const { position, rotation } = viewer.cameraManager.getCameraState();
        position.set(
          SceneConfigurationProperties.cameraTranslationX,
          SceneConfigurationProperties.cameraTranslationY,
          SceneConfigurationProperties.cameraTranslationZ
        );

        const euler = new THREE.Euler(
          SceneConfigurationProperties.cameraEulerRotationX,
          SceneConfigurationProperties.cameraEulerRotationY,
          SceneConfigurationProperties.cameraEulerRotationZ,
          'XYZ'
        );
        const quaternion = new THREE.Quaternion().setFromEuler(euler);
        rotation.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

        viewer.cameraManager.setCameraState({ position, rotation });
      }

      // Ground plane
      {
        const textureLoader = new THREE.TextureLoader();
        const textureUrl = '';
        textureLoader.load(textureUrl, function (texture) {
          // Step 2: Create the material
          const material = new THREE.MeshBasicMaterial({ map: texture });

          // Step 3: Create the geometry
          const geometry = new THREE.PlaneGeometry(1000, 1000);

          // Step 4: Create the mesh
          const mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.set(-Math.PI / 2, 0, 0);
          mesh.translateZ(480);

          // Step 5: Add the mesh to the scene
          viewer.addObject3D(mesh);
          groundPlaneRef.current = mesh;
        });
      }

      const modelOptions: AddModelOptions[] = [];
      const transform: Matrix4 = new Matrix4();
      const modelId = 0;
      const revisionId = 0;
      modelOptions.push({ modelId, revisionId });
      modelOptions.forEach((model) => {
        addModels(model, transform)
          .then((model) => {
            setRevealResourcesCount(viewer.models.length);
            viewer.fitCameraToModel(model);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    };

    const getSceneQuery = createGetSceneQuery('sceneconfig_batch_0', 'scene_space');
    void loadScene(getSceneQuery).then(async () => {
      console.log('loaded');
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      // await cleanupScene();
    });
  }, [sceneExternalId, sceneSpaceId]);

  async function cleanupScene(): Promise<void> {
    if (skyboxRef.current !== null && skyboxRef.current !== undefined) {
      viewer.removeObject3D(skyboxRef.current);
    }
    skyboxRef.current = undefined;

    console.log(groundPlaneRef.current);
    if (groundPlaneRef.current !== null && groundPlaneRef.current !== undefined) {
      viewer.removeObject3D(groundPlaneRef.current);
    }
    groundPlaneRef.current = undefined;

    cadModelsRef.current.forEach((model) => {
      viewer.removeModel(model);
    });
  }

  async function addModels(
    addModelOptions: AddModelOptions,
    transform?: Matrix4
  ): Promise<CogniteCadModel> {
    const cadModel = await getOrAddModel();
    cadModelsRef.current.push(cadModel);

    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }

    console.log(cadModel.getModelTransformation());
    return cadModel;

    async function getOrAddModel(): Promise<CogniteCadModel> {
      const viewerModel = viewer.models.find(
        (model) =>
          model.modelId === addModelOptions.modelId &&
          model.revisionId === addModelOptions.revisionId &&
          model.getModelTransformation().equals(transform ?? new Matrix4())
      );
      if (viewerModel !== undefined) {
        return await Promise.resolve(viewerModel as CogniteCadModel);
      }
      return await viewer.addCadModel(addModelOptions);
    }
  }

  return <></>;
}
