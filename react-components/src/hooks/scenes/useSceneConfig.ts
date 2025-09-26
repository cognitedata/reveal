import { sceneQuery } from './sceneQuery';
import {
  type GroundPlaneProperties,
  type Transformation3d,
  type SkyboxProperties,
  type SceneModelsProperties,
  type Scene360ImageCollectionsProperties,
  type GroundPlaneResponse,
  type GroundPlaneEdgeResponse,
  type SceneModelsResponse,
  type Image360CollectionsResponse
} from '../../components/SceneContainer/SceneFdmTypes';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type CadOrPointCloudModel,
  type GroundPlane,
  type Image360Collection,
  type Scene,
  type Skybox
} from '../../components/SceneContainer/sceneTypes';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';
import { type Source, type FdmSDK } from '../../data-providers/FdmSDK';
import { fdmViewsExist } from '../../utilities/fdmViewsExist';
import {
  type Cdf3dImage360CollectionProperties,
  ENVIRONMENT_MAP_SOURCE,
  GROUND_PLANE_SOURCE,
  IMAGE_360_COLLECTION_SOURCE,
  REVISION_SOURCE,
  SCENE_SOURCE,
  type SceneConfigurationProperties,
  type TRANSFORMATION_SOURCE
} from './types';
import { tryGetModelIdFromExternalId } from '../../utilities/tryGetModelIdFromExternalId';
import { getRevisionExternalIdAndSpace } from '../network/getRevisionExternalIdAndSpace';
import { EMPTY_ARRAY } from '../../utilities/constants';
import {
  isScene360CollectionEdge,
  isScene3dModelEdge,
  isSceneConfigurationProperties
} from './sceneResponseTypeGuards';

const DefaultScene: Scene = {
  sceneConfiguration: {
    name: '',
    cameraTranslationX: 0,
    cameraTranslationY: 0,
    cameraTranslationZ: 0,
    cameraEulerRotationX: 0,
    cameraEulerRotationY: 0,
    cameraEulerRotationZ: 0,
    qualitySettings: {
      cadBudget: 0,
      pointCloudBudget: 0,
      maxRenderResolution: 0,
      movingCameraResolutionFactor: 0,
      pointCloudPointSize: 0,
      pointCloudPointShape: '',
      pointCloudColor: ''
    }
  },
  skybox: undefined,
  groundPlanes: [],
  sceneModels: [],
  image360Collections: []
};

export const useSceneConfig = (
  sceneExternalId: string | undefined,
  sceneSpace: string | undefined
): UseQueryResult<Scene | null> => {
  const fdmSdk = useFdmSdk();
  return useQuery({
    queryKey: ['reveal', 'react-components', 'sync-scene-config', sceneExternalId, sceneSpace],
    queryFn: async () => {
      if (sceneExternalId === undefined || sceneSpace === undefined) {
        return null;
      }

      const isSceneEnabledInProject = await sceneViewsExist(fdmSdk);

      if (!isSceneEnabledInProject) {
        return DefaultScene;
      }

      const query = {
        ...sceneQuery,
        parameters: { sceneExternalId, sceneSpace }
      };

      const queryResult = await fdmSdk.queryNodesAndEdges<
        typeof query,
        [
          { source: typeof SCENE_SOURCE; properties: SceneConfigurationProperties },
          { source: typeof ENVIRONMENT_MAP_SOURCE; properties: SkyboxProperties },
          { source: typeof GROUND_PLANE_SOURCE; properties: GroundPlaneProperties },
          { source: typeof TRANSFORMATION_SOURCE; properties: Transformation3d },
          { source: typeof REVISION_SOURCE; properties: SceneModelsProperties },
          {
            source: typeof IMAGE_360_COLLECTION_SOURCE;
            properties: Scene360ImageCollectionsProperties;
          }
        ]
      >(query);

      const sceneResponse = queryResult;
      const sceneConfigurationProperties = extractSceneProperties(
        sceneResponse.items.myScene[0]?.properties
      );

      const scene: Scene = {
        sceneConfiguration: {
          name: sceneConfigurationProperties.name,
          cameraTranslationX: sceneConfigurationProperties.cameraTranslationX,
          cameraTranslationY: sceneConfigurationProperties.cameraTranslationY,
          cameraTranslationZ: sceneConfigurationProperties.cameraTranslationZ,
          cameraEulerRotationX: sceneConfigurationProperties.cameraEulerRotationX,
          cameraEulerRotationY: sceneConfigurationProperties.cameraEulerRotationY,
          cameraEulerRotationZ: sceneConfigurationProperties.cameraEulerRotationZ,
          cameraTargetX: sceneConfigurationProperties.cameraTargetX,
          cameraTargetY: sceneConfigurationProperties.cameraTargetY,
          cameraTargetZ: sceneConfigurationProperties.cameraTargetZ,
          updatedAt: sceneConfigurationProperties.updatedAt,
          qualitySettings: {
            cadBudget: sceneConfigurationProperties.cadBudget,
            pointCloudBudget: sceneConfigurationProperties.pointCloudBudget,
            maxRenderResolution: sceneConfigurationProperties.maxRenderResolution,
            movingCameraResolutionFactor: sceneConfigurationProperties.movingCameraResolutionFactor,
            pointCloudPointSize: sceneConfigurationProperties.pointCloudPointSize,
            pointCloudPointShape: sceneConfigurationProperties.pointCloudPointShape,
            pointCloudColor: sceneConfigurationProperties.pointCloudColor
          }
        },
        skybox: getSkybox(sceneResponse.items.skybox[0]?.properties),
        groundPlanes: getGroundPlanes(
          sceneResponse.items.groundPlanes,
          sceneResponse.items.groundPlaneEdges
        ),
        sceneModels: await getSceneModels(
          sceneResponse.items.sceneModels.filter(isScene3dModelEdge),
          fdmSdk
        ),
        image360Collections: getImageCollections(
          sceneResponse.items.image360CollectionsEdges.filter(isScene360CollectionEdge)
        )
      };
      return scene;
    },
    enabled: sceneExternalId !== undefined && sceneSpace !== undefined,
    staleTime: Infinity
  });
};

async function sceneViewsExist(fdmSdk: FdmSDK): Promise<boolean> {
  const neededViews: Source[] = [
    SCENE_SOURCE,
    REVISION_SOURCE,
    IMAGE_360_COLLECTION_SOURCE,
    ENVIRONMENT_MAP_SOURCE,
    GROUND_PLANE_SOURCE
  ];

  return await fdmViewsExist(fdmSdk, neededViews);
}

function extractSceneProperties(
  scenesProperties: Record<string, Record<string, unknown>>
): SceneConfigurationProperties {
  const currentSceneProperties = scenesProperties.scene['SceneConfiguration/v1'];
  if (!isSceneConfigurationProperties(currentSceneProperties)) {
    throw new Error('Scene configuration properties are missing or invalid');
  }
  return currentSceneProperties;
}

function extractProperties<T>(object: Record<string, Record<string, T>>): T {
  const firstKey = Object.keys(object)[0];
  const secondKey = Object.keys(object[firstKey])[0];
  return object[firstKey][secondKey];
}

async function getSceneModels(
  sceneModels: SceneModelsResponse[],
  fdmSdk: FdmSDK
): Promise<CadOrPointCloudModel[]> {
  if (sceneModels.length === 0) {
    return EMPTY_ARRAY;
  }

  const modelPromises = sceneModels.map(async (sceneModel) => {
    const sceneModelProperties = extractProperties<SceneModelsProperties>(sceneModel.properties);
    const dmModelIdentifier = await getRevisionExternalIdAndSpace(
      sceneModel.endNode.externalId,
      sceneModelProperties.revisionId,
      fdmSdk
    );

    if (dmModelIdentifier !== undefined) {
      return createDMModel(sceneModelProperties, dmModelIdentifier);
    } else {
      const parsedModelId = tryGetModelIdFromExternalId(sceneModel.endNode.externalId);
      if (parsedModelId === undefined) {
        throw new Error(
          `Could not parse model Id from externalId ${sceneModel.endNode.externalId}`
        );
      }
      return createClassicModel(sceneModelProperties, parsedModelId);
    }
  });

  return await Promise.all(modelPromises);
}

function getImageCollections(sceneModels: Image360CollectionsResponse[]): Image360Collection[] {
  const imageCollections: Image360Collection[] = [];
  if (sceneModels.length > 0) {
    sceneModels.forEach((sceneModel) => {
      const imageCollectionProperties = extractProperties<Cdf3dImage360CollectionProperties>(
        sceneModel.properties
      );
      const collection: Image360Collection = {
        ...imageCollectionProperties
      };

      imageCollections.push(collection);
    });
  }
  return imageCollections;
}

function getGroundPlanes(
  groundPlaneResponse: GroundPlaneResponse[],
  groundPlaneEdgeResponse: GroundPlaneEdgeResponse[]
): GroundPlane[] {
  const groundPlanes: GroundPlane[] = [];
  if (groundPlaneResponse.length > 0) {
    // Match groundplanes with their edges
    groundPlaneEdgeResponse.forEach((groundPlaneEdge) => {
      const mappedGroundPlane = groundPlaneResponse.find(
        (groundPlane) =>
          groundPlane.externalId === groundPlaneEdge.endNode.externalId &&
          groundPlane.space === groundPlaneEdge.endNode.space
      );

      if (mappedGroundPlane !== undefined) {
        const { label, file, wrapping, repeatU, repeatV } =
          extractProperties<GroundPlaneProperties>(mappedGroundPlane.properties);
        const groundPlaneEdgeProperties = extractProperties<Transformation3d>(
          groundPlaneEdge.properties
        );
        const groundPlane: GroundPlane = {
          label,
          file,
          wrapping,
          repeatU: repeatU ?? 1,
          repeatV: repeatV ?? 1,
          ...groundPlaneEdgeProperties
        };
        groundPlanes.push(groundPlane);
      }
    });
  }
  return groundPlanes;
}

function getSkybox(
  skyBoxProperties: Record<string, Record<string, SkyboxProperties>> | undefined
): Skybox | undefined {
  if (skyBoxProperties === undefined) {
    return undefined;
  }
  const { label, isSpherical, file } = extractProperties<SkyboxProperties>(skyBoxProperties);
  return {
    label,
    isSpherical,
    file
  };
}

function createDMModel(
  sceneModelProperties: SceneModelsProperties,
  dMModelIdentifier: { revisionExternalId: string; revisionSpace: string }
): CadOrPointCloudModel {
  return {
    modelIdentifier: {
      revisionExternalId: dMModelIdentifier.revisionExternalId,
      revisionSpace: dMModelIdentifier.revisionSpace
    },
    ...sceneModelProperties
  };
}

function createClassicModel(
  sceneModelProperties: SceneModelsProperties,
  modelId: number
): CadOrPointCloudModel {
  return {
    modelIdentifier: {
      modelId,
      revisionId: sceneModelProperties.revisionId
    },
    ...sceneModelProperties
  };
}
