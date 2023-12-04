/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef, useState } from 'react';
import { type CogniteModel, type AddModelOptions } from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { Matrix4 } from 'three';
import * as THREE from 'three';
import { type Query } from '../../utilities/FdmSDK';
import { useFdmSdk } from '../RevealContainer/SDKProvider';
import { createGetSceneQuery } from './Queries';
import {
  type GroundPlaneProperties,
  type SceneResponse,
  type SkyboxProperties
} from './SceneFdmTypes';
import { CadModelContainer } from '../CadModelContainer/CadModelContainer';
import { PointCloudContainer } from '../..';
import type CogniteClient from '@cognite/sdk/dist/src/cogniteClient';

export type CogniteSceneProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
  sdk: CogniteClient;
};

type AddModelOptionsAndTransform = {
  addModelOptions: AddModelOptions;
  transform?: Matrix4;
};

export function SceneContainer({
  sceneExternalId,
  sceneSpaceId,
  sdk
}: CogniteSceneProps): ReactElement {
  const viewer = useReveal();
  const fdmSdk = useFdmSdk();
  const skyboxRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();
  const groundPlaneRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();
  const cadModelIds = useRef<AddModelOptionsAndTransform[]>([]);
  const pointCloudIds = useRef<AddModelOptionsAndTransform[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

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

      // Skybox
      const hasSkybox = scene.items.skybox.length > 0;
      let skyboxProperties: SkyboxProperties;
      if (hasSkybox) {
        const skybox = scene.items.skybox[0];
        const skyboxProps = skybox.properties;
        const skyboxKey = Object.keys(skyboxProps)[0]; // Get the first key
        const skyboxTypeKey = Object.keys(skyboxProps[skyboxKey])[0];
        skyboxProperties = skyboxProps[skyboxKey][skyboxTypeKey];

        const skyboxExternalId = skyboxProperties.file;
        const skyBoxUrls = await sdk.files.getDownloadUrls([{ externalId: skyboxExternalId }]);
        const skyboxUrl = skyBoxUrls[0].downloadUrl;

        const skyboxMesh = new THREE.Mesh(
          new THREE.SphereGeometry(300000, 0, 0),
          new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: new THREE.TextureLoader().load(skyboxUrl)
          })
        );
        viewer.addObject3D(skyboxMesh);
        skyboxRef.current = skyboxMesh;
      }

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

      const hasSceneModels = scene.items.sceneModels.length > 0;
      console.log(hasSceneModels);
      if (hasSceneModels) {
        const sceneModels = scene.items.sceneModels;
        void Promise.all(
          sceneModels.map(async (sceneModel) => {
            const sceneModelProps = sceneModel.properties;
            const sceneModelKey = Object.keys(sceneModelProps)[0]; // Get the first key
            const sceneModelTypeKey = Object.keys(sceneModelProps[sceneModelKey])[0];
            const sceneModelProperties = sceneModelProps[sceneModelKey][sceneModelTypeKey];
            console.log(sceneModelProperties);

            const modelId: number = Number(sceneModel.endNode.externalId);
            const revisionId: number = sceneModelProperties.revisionId;

            if (isNaN(modelId)) {
              throw new Error('Model id is not a number');
            }
            const addModelOptions: AddModelOptions = {
              modelId,
              revisionId
            };

            const transform = new Matrix4();
            transform.set(
              sceneModelProperties.scaleX,
              0,
              0,
              sceneModelProperties.translationX,
              0,
              sceneModelProperties.scaleY,
              0,
              sceneModelProperties.translationY,
              0,
              0,
              sceneModelProperties.scaleZ,
              sceneModelProperties.translationZ,
              0,
              0,
              0,
              1
            );

            const modelType = await viewer.determineModelType(modelId, revisionId);
            let model: CogniteModel;
            switch (modelType) {
              case 'cad':
                model = await viewer.addCadModel(addModelOptions);
                break;
              case 'pointcloud':
                model = await viewer.addPointCloudModel(addModelOptions);
                break;
              default:
                throw new Error('Model is not supported');
            }
            viewer.fitCameraToModel(model);
            console.log('Fitting camera to model');
          })
        );
      }

      setLoaded(true);
    };

    // Don't load when in initial state
    console.log('SceneContainer');
    // if (sceneExternalId !== '' && sceneSpaceId !== '') {
    const getSceneQuery = createGetSceneQuery('my_scene_external_id', 'scene_space');
    void loadScene(getSceneQuery).then(async () => {
      console.log('loaded');
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
  }

  return (
    <>
      {loaded &&
        cadModelIds.current.map((options, index) => (
          <CadModelContainer
            key={index} // replace 'id' with the actual id property
            addModelOptions={options.addModelOptions}
            transform={options.transform}
            styling={undefined}
            onLoad={undefined}
            onLoadError={undefined}
          />
        ))}
      {loaded &&
        pointCloudIds.current.map((options, index) => (
          <PointCloudContainer
            key={index} // replace 'id' with the actual id property
            addModelOptions={options.addModelOptions}
            transform={options.transform}
            styling={undefined}
            onLoad={undefined}
            onLoadError={undefined}
          />
        ))}
    </>
  );
}
