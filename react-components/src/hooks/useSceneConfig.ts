/*!
 * Copyright 2023 Cognite AS
 */
import { createGetSceneQuery } from '../components/SceneContainer/Queries';
import {
  type GroundPlaneProperties,
  type Transformation3d,
  type SceneResponse,
  type SkyboxProperties,
  type SceneModelsProperties,
  type Scene360ImageCollectionsProperties
} from '../components/SceneContainer/SceneFdmTypes';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type CadOrPointCloudModel,
  type GroundPlane,
  type Image360Collection,
  type Scene,
  type Skybox
} from '../components/SceneContainer/SceneTypes';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { type Source, type FdmSDK } from '../utilities/FdmSDK';

const DefaultScene: Scene = {
  sceneConfiguration: {
    name: '',
    cameraTranslationX: 0,
    cameraTranslationY: 0,
    cameraTranslationZ: 0,
    cameraEulerRotationX: 0,
    cameraEulerRotationY: 0,
    cameraEulerRotationZ: 0
  },
  skybox: undefined,
  groundPlanes: [],
  sceneModels: [],
  image360Collections: []
};

export const useSceneConfig = (
  sceneExternalId: string,
  sceneSpaceExternalId: string
): UseQueryResult<Scene> => {
  const fdmSdk = useFdmSdk();
  return useQuery(
    ['reveal', 'react-components', 'sync-scene-config', sceneExternalId, sceneSpaceExternalId],
    async () => {
      const isSceneEnabledInProject = await sceneViewsExist(fdmSdk);

      if (!isSceneEnabledInProject) {
        return DefaultScene;
      }

      const getSceneQuery = createGetSceneQuery(sceneExternalId, sceneSpaceExternalId);
      const queryResult = await fdmSdk.queryNodesAndEdges({
        ...getSceneQuery
      });

      const sceneResponse = queryResult as any as SceneResponse;
      const SceneConfigurationProperties = extractProperties(
        sceneResponse.items.myScene[0]?.properties
      );

      const scene: Scene = {
        sceneConfiguration: {
          name: SceneConfigurationProperties.name,
          cameraTranslationX: SceneConfigurationProperties.cameraTranslationX,
          cameraTranslationY: SceneConfigurationProperties.cameraTranslationY,
          cameraTranslationZ: SceneConfigurationProperties.cameraTranslationZ,
          cameraEulerRotationX: SceneConfigurationProperties.cameraEulerRotationX,
          cameraEulerRotationY: SceneConfigurationProperties.cameraEulerRotationY,
          cameraEulerRotationZ: SceneConfigurationProperties.cameraEulerRotationZ
        },
        skybox: getSkybox(sceneResponse),
        groundPlanes: getGroundPlanes(sceneResponse),
        sceneModels: getSceneModels(sceneResponse),
        image360Collections: getImageCollections(sceneResponse)
      };
      return scene;
    },
    { staleTime: Infinity }
  );
};

async function sceneViewsExist(fdmSdk: FdmSDK): Promise<boolean> {
  const neededViews: Source[] = [
    {
      type: 'view',
      space: 'scene',
      externalId: 'SceneConfiguration',
      version: 'v1'
    },
    {
      type: 'view',
      space: 'scene',
      externalId: 'RevisionProperties',
      version: 'v1'
    },
    {
      type: 'view',
      space: 'scene',
      externalId: 'Image360CollectionProperties',
      version: 'v1'
    },
    {
      type: 'view',
      space: 'scene',
      externalId: 'EnvironmentMap',
      version: 'v1'
    },
    {
      type: 'view',
      space: 'scene',
      externalId: 'TexturedPlane',
      version: 'v1'
    }
  ];
  const views = await fdmSdk.getViewsByIds(neededViews);
  if (views.items.length === neededViews.length) {
    return true;
  }
  return false;
}

function extractProperties(object: any): any {
  const firstKey = Object.keys(object)[0];
  const secondKey = Object.keys(object[firstKey])[0];
  return object[firstKey][secondKey];
}

function getSceneModels(sceneResponse: SceneResponse): CadOrPointCloudModel[] {
  const models: CadOrPointCloudModel[] = [];
  if (sceneResponse.items.sceneModels.length > 0) {
    const sceneModels = sceneResponse.items.sceneModels;
    sceneModels.forEach((sceneModel) => {
      const sceneModelProperties = extractProperties(
        sceneModel.properties
      ) as SceneModelsProperties;
      if (!isNaN(Number(sceneModel.endNode.externalId))) {
        const model: CadOrPointCloudModel = {
          modelId: Number(sceneModel.endNode.externalId),
          ...sceneModelProperties
        };

        models.push(model);
      }
    });
  }
  return models;
}

function getImageCollections(sceneResponse: SceneResponse): Image360Collection[] {
  const imageCollections: Image360Collection[] = [];
  if (sceneResponse.items.sceneModels.length > 0) {
    const sceneModels = sceneResponse.items.image360CollectionsEdges;
    sceneModels.forEach((sceneModel) => {
      const imageCollectionProperties = extractProperties(
        sceneModel.properties
      ) as Scene360ImageCollectionsProperties;
      if (!isNaN(Number(sceneModel.endNode.externalId))) {
        const collection: Image360Collection = {
          ...imageCollectionProperties
        };

        imageCollections.push(collection);
      }
    });
  }
  return imageCollections;
}

function getGroundPlanes(sceneResponse: SceneResponse): GroundPlane[] {
  const groundPlanes: GroundPlane[] = [];
  if (sceneResponse.items.groundPlanes.length > 0) {
    const groundPlaneResponse = sceneResponse.items.groundPlanes;
    const groundPlaneEdgeResponse = sceneResponse.items.groundPlaneEdges;

    // Match groundplanes with their edges
    groundPlaneEdgeResponse.forEach((groundPlaneEdge) => {
      const mappedGroundPlane = groundPlaneResponse.find(
        (groundPlane) => groundPlane.externalId === groundPlaneEdge.endNode.externalId
      );

      if (mappedGroundPlane !== undefined) {
        const { label, file, wrapping } = extractProperties(
          mappedGroundPlane.properties
        ) as GroundPlaneProperties;
        const groundPlaneEdgeProperties = extractProperties(
          groundPlaneEdge.properties
        ) as Transformation3d;
        const groundPlane: GroundPlane = {
          label,
          file,
          wrapping,
          ...groundPlaneEdgeProperties
        };
        groundPlanes.push(groundPlane);
      }
    });
  }
  return groundPlanes;
}

function getSkybox(sceneResponse: SceneResponse): Skybox | undefined {
  if (sceneResponse.items.skybox.length === 0) {
    return undefined;
  }

  const { label, isSpherical, file } = extractProperties(
    sceneResponse.items.skybox[0].properties
  ) as SkyboxProperties;
  return {
    label,
    isSpherical,
    file
  };
}
