/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef, useState } from 'react';
import { type AddModelOptions } from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import * as THREE from 'three';
import { type Query } from '../../utilities/FdmSDK';
import { useFdmSdk } from '../RevealContainer/SDKProvider';
import { createGetSceneQuery } from './Queries';
import {
  type GroundPlaneResponse,
  type GroundPlaneProperties,
  type SceneResponse,
  type SkyboxProperties,
  type GroundPlaneEdgeResponse,
  type Transformation3d,
  type SceneModelsProperties,
  type Scene360ImageCollectionsProperties
} from './SceneFdmTypes';
import { type AddResourceOptions, Reveal3DResources } from '../..';
import type CogniteClient from '@cognite/sdk/dist/src/cogniteClient';
import {
  type AddImageCollection360DatamodelsOptions,
  type AssetMappingStylingGroup,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../Reveal3DResources/types';

export type CogniteSceneProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
  sdk: CogniteClient;
  defaultResourceStyling?: DefaultResourceStyling;
  instanceStyling?: Array<FdmAssetStylingGroup | AssetMappingStylingGroup>;
  onResourcesAdded?: () => void;
  onResourceLoadError?: (error: any) => void;
};

export function SceneContainer({
  sceneExternalId,
  sceneSpaceId,
  sdk,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError
}: CogniteSceneProps): ReactElement {
  const viewer = useReveal();
  const fdmSdk = useFdmSdk();
  const skyboxRef = useRef<THREE.Object3D<THREE.Object3DEventMap>>();
  const groundPlaneRef = useRef<Array<THREE.Object3D<THREE.Object3DEventMap>>>([]);
  const resourceOptions = useRef<AddResourceOptions[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadScene = async (query: Query): Promise<void> => {
      // FDM query for scene
      const res = await fdmSdk.queryNodesAndEdges({
        ...query
      });

      const scene = res as any as SceneResponse;
      const SceneConfigurationProperties = extractProperties(scene.items.myScene[0].properties);

      if (scene.items.groundPlanes.length > 0) {
        const groundPlanes = scene.items.groundPlanes;
        const groundPlaneEdges = scene.items.groundPlaneEdges;

        // Match groundplanes with their edges
        const groundPlaneNodeAndEdgeMap = new Map<GroundPlaneResponse, GroundPlaneEdgeResponse>();
        groundPlaneEdges.forEach((groundPlaneEdge) => {
          const mappedGroundPlane = groundPlanes.find(
            (groundPlane) => groundPlane.externalId === groundPlaneEdge.endNode.externalId
          );
          if (mappedGroundPlane !== undefined) {
            groundPlaneNodeAndEdgeMap.set(mappedGroundPlane, groundPlaneEdge);
          }
        });

        // Unpack early as we need to get download urls and want to batch them all into one request
        const groundPlanePropertiesNodeAndEdgeMap = new Map<
          GroundPlaneProperties,
          Transformation3d
        >();
        groundPlaneNodeAndEdgeMap.forEach((groundPlaneEdge, groundPlane) => {
          const groundPlaneProperties = extractProperties(
            groundPlane.properties
          ) as GroundPlaneProperties;
          const groundPlaneEdgeProperties = extractProperties(groundPlaneEdge.properties);
          groundPlanePropertiesNodeAndEdgeMap.set(groundPlaneProperties, groundPlaneEdgeProperties);
        });

        const groundPlaneTextureUrls = await sdk.files.getDownloadUrls(
          Array.from(groundPlanePropertiesNodeAndEdgeMap.keys()).map((groundPlaneProperties) => ({
            externalId: groundPlaneProperties.file
          }))
        );

        let index = 0;
        groundPlanePropertiesNodeAndEdgeMap.forEach((groundPlaneEdgeProperties) => {
          const textureUrl = groundPlaneTextureUrls[index++].downloadUrl;
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(textureUrl, function (texture) {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometry = new THREE.PlaneGeometry(1000, 1000);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              groundPlaneEdgeProperties.translationX,
              groundPlaneEdgeProperties.translationY,
              groundPlaneEdgeProperties.translationZ
            );
            mesh.rotation.set(-Math.PI, 0, 0);
            viewer.addObject3D(mesh);
            groundPlaneRef.current.push(mesh);
          });
        });
      }

      // Skybox
      if (scene.items.skybox.length > 0) {
        const skyboxProperties = extractProperties(
          scene.items.skybox[0].properties
        ) as SkyboxProperties;

        const skyboxExternalId = skyboxProperties.file;
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

      // Camera translation and rotation
      {
        const position = new THREE.Vector3(
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
        const vec = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);

        // There is a bug with setCameraState rotation, so must first set transform
        // and then lookAt the correct direction
        viewer.cameraManager.setCameraState({ position });
        viewer.cameraManager.getCamera().lookAt(position.clone().add(vec));
      }

      if (scene.items.sceneModels.length > 0) {
        const sceneModels = scene.items.sceneModels;
        void Promise.all(
          sceneModels.map(async (sceneModel) => {
            const sceneModelProperties = extractProperties(
              sceneModel.properties
            ) as SceneModelsProperties;

            const modelId: number = Number(sceneModel.endNode.externalId);
            const revisionId: number = sceneModelProperties.revisionId;

            if (isNaN(modelId)) {
              throw new Error('Model id is not a number');
            }
            const addModelOptions: AddModelOptions = {
              modelId,
              revisionId
            };

            const transform = new THREE.Matrix4();
            const scale = new THREE.Matrix4().makeScale(
              sceneModelProperties.scaleX,
              sceneModelProperties.scaleY,
              sceneModelProperties.scaleZ
            );
            const euler = new THREE.Euler(
              sceneModelProperties.eulerRotationX,
              sceneModelProperties.eulerRotationY,
              sceneModelProperties.eulerRotationZ,
              'XYZ'
            );
            const rotation = new THREE.Matrix4().makeRotationFromEuler(euler);
            // Create translation matrix
            const translation = new THREE.Matrix4().makeTranslation(
              sceneModelProperties.translationX,
              sceneModelProperties.translationY,
              sceneModelProperties.translationZ
            );

            // Combine transformations
            transform.multiply(scale).multiply(rotation).multiply(translation);
            resourceOptions.current.push({ ...addModelOptions, transform });
          })
        );
      }

      if (scene.items.image360CollectionsEdges.length > 0) {
        const image360Collections = scene.items.image360CollectionsEdges;
        void Promise.all(
          image360Collections.map(async (image360Collection) => {
            const Image360CollectionProperties = extractProperties(
              image360Collection.properties
            ) as Scene360ImageCollectionsProperties;

            const externalId = Image360CollectionProperties.image360CollectionExternalId;
            const space = Image360CollectionProperties.image360CollectionSpace;

            if (externalId === '' || space === '') return;

            const addModelOptions: AddImageCollection360DatamodelsOptions = {
              externalId,
              space
            };

            const transform = new THREE.Matrix4();
            const scale = new THREE.Matrix4().makeScale(
              Image360CollectionProperties.scaleX,
              Image360CollectionProperties.scaleY,
              Image360CollectionProperties.scaleZ
            );
            const euler = new THREE.Euler(
              Image360CollectionProperties.eulerRotationX,
              Image360CollectionProperties.eulerRotationY,
              Image360CollectionProperties.eulerRotationZ,
              'XYZ'
            );
            const rotation = new THREE.Matrix4().makeRotationFromEuler(euler);
            // Create translation matrix
            const translation = new THREE.Matrix4().makeTranslation(
              Image360CollectionProperties.translationX,
              Image360CollectionProperties.translationY,
              Image360CollectionProperties.translationZ
            );

            // Combine transformations
            transform.multiply(scale).multiply(rotation).multiply(translation);
            resourceOptions.current.push({ ...addModelOptions, transform });
          })
        );

        resourceOptions.current.forEach((resource) => {
          console.log(resource);
        });
        setLoaded(true);
      }
    };

    const getSceneQuery = createGetSceneQuery('my_scene_external_id', 'scene_space');
    void loadScene(getSceneQuery)
      .then(async () => {
        console.log('loaded');
      })
      .catch((error) => {
        console.log(error);
      });
  }, [sceneExternalId, sceneSpaceId]);

  async function cleanupScene(): Promise<void> {
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

    resourceOptions.current.splice(0, resourceOptions.current.length);
  }

  function extractProperties(object: any): any {
    const firstKey = Object.keys(object)[0];
    const secondKey = Object.keys(object[firstKey])[0];
    return object[firstKey][secondKey];
  }

  return (
    <>
      {loaded && (
        <Reveal3DResources
          resources={resourceOptions.current}
          defaultResourceStyling={defaultResourceStyling}
          instanceStyling={instanceStyling}
          onResourceLoadError={onResourceLoadError}
        />
      )}
    </>
  );
}
