import { useContext, useMemo } from 'react';
import { type QueryFunction } from '@tanstack/react-query';
import { type CogniteClient } from '@cognite/sdk';
import { type EdgeItem, type NodeItem } from '../../data-providers/FdmSDK';
import { Euler, MathUtils, Matrix4 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type GroundPlane } from '../../components/SceneContainer/sceneTypes';
import { type AddImage360CollectionDatamodelsOptions } from '../../components/Reveal3DResources/types';
import {
  SCENE_QUERY_LIMIT,
  type Cdf3dImage360CollectionProperties,
  type Cdf3dRevisionProperties,
  type ENVIRONMENT_MAP_SOURCE,
  type GROUND_PLANE_SOURCE,
  type GroundPlaneProperties,
  type IMAGE_360_COLLECTION_SOURCE,
  type REVISION_SOURCE,
  type SCENE_SOURCE,
  type SceneConfigurationProperties,
  type SceneData,
  type SkyboxProperties,
  type Transformation3d,
  type TRANSFORMATION_SOURCE
} from './types';
import {
  type Use3dScenesResult,
  type ScenesMap,
  type Space,
  type ExternalId,
  type Use3dScenesQueryResult,
  type SceneNode
} from './use3dScenes.types';
import { tryGetModelIdFromExternalId } from '../../utilities/tryGetModelIdFromExternalId';
import { createGetScenesQuery } from './allScenesQuery';
import { Use3dScenesContext } from './use3dScenes.context';
import { isScene360CollectionEdge, isScene3dModelEdge } from './sceneResponseTypeGuards';

export function use3dScenes(userSdk?: CogniteClient): Use3dScenesResult {
  const { useSDK, useQuery, createFdmSdk } = useContext(Use3dScenesContext);

  const sdk = useSDK(userSdk);
  const fdmSdk = useMemo(() => createFdmSdk(sdk), [createFdmSdk, sdk]);

  const queryFunction: QueryFunction<ScenesMap> = async () => {
    const allScenes: Use3dScenesQueryResult = {
      scenes: [],
      sceneModels: [],
      scene360Collections: [],
      sceneGroundPlanes: [],
      sceneGroundPlaneEdges: [],
      sceneSkybox: []
    };
    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      const scenesQuery = createGetScenesQuery(SCENE_QUERY_LIMIT, cursor);
      const response = await fdmSdk.queryNodesAndEdges<
        typeof scenesQuery,
        [
          { source: typeof SCENE_SOURCE; properties: SceneConfigurationProperties },
          { source: typeof TRANSFORMATION_SOURCE; properties: Transformation3d },
          { source: typeof ENVIRONMENT_MAP_SOURCE; properties: SkyboxProperties },
          {
            source: typeof IMAGE_360_COLLECTION_SOURCE;
            properties: Cdf3dImage360CollectionProperties;
          },
          { source: typeof REVISION_SOURCE; properties: Cdf3dRevisionProperties },
          { source: typeof GROUND_PLANE_SOURCE; properties: GroundPlaneProperties }
        ]
      >(scenesQuery);

      const scene3dModels = response.items.sceneModels.filter(isScene3dModelEdge);
      const scene360Collections =
        response.items.scene360Collections.filter(isScene360CollectionEdge);

      allScenes.scenes.push(...response.items.scenes);
      allScenes.sceneModels.push(...scene3dModels);
      allScenes.scene360Collections.push(...scene360Collections);
      allScenes.sceneGroundPlanes.push(...response.items.sceneGroundPlanes);
      allScenes.sceneGroundPlaneEdges.push(...response.items.sceneGroundPlaneEdges);
      allScenes.sceneSkybox.push(...response.items.sceneSkybox);

      cursor = response.nextCursor?.scenes;
      hasMore = SCENE_QUERY_LIMIT === response.items.scenes.length && cursor !== undefined;
    }

    const scenesMap = createMapOfScenes(allScenes.scenes, allScenes.sceneSkybox);
    populateSceneMapWithModels(allScenes.sceneModels, scenesMap, tryGetModelIdFromExternalId);
    populateSceneMapWith360Images(allScenes.scene360Collections, scenesMap);
    populateSceneMapWithGroundplanes(
      allScenes.sceneGroundPlanes,
      allScenes.sceneGroundPlaneEdges,
      scenesMap
    );

    return scenesMap;
  };

  return useQuery<ScenesMap>({
    queryKey: ['reveal-react-components', 'cdf', '3d', 'scenes'],
    queryFn: queryFunction
  });
}

function createMapOfScenes(
  scenes: SceneNode[],
  skyboxes: Array<NodeItem<SkyboxProperties>>
): Record<Space, Record<ExternalId, SceneData>> {
  return scenes.reduce((acc: Record<Space, Record<ExternalId, SceneData>>, scene: SceneNode) => {
    const { space, externalId } = scene;
    if (acc[space] === undefined) {
      acc[space] = {};
    }
    if (acc[space][externalId] === undefined) {
      const properties = scene.properties.scene['SceneConfiguration/v1'];
      let skyboxObject: SkyboxProperties | undefined;
      const skyboxIdentifier = properties.skybox;
      if (skyboxIdentifier !== undefined) {
        const connectedSkybox = skyboxes.find(
          (skybox) =>
            skybox.externalId === skyboxIdentifier.externalId &&
            skybox.space === skyboxIdentifier.space
        );
        if (connectedSkybox !== undefined) {
          const skyboxProperties = Object.values(Object.values(connectedSkybox.properties)[0])[0];
          skyboxObject = skyboxProperties;
        }
      }

      acc[space][externalId] = {
        name: properties.name ?? '',
        cameraTranslationX: properties.cameraTranslationX ?? 0,
        cameraTranslationY: properties.cameraTranslationY ?? 0,
        cameraTranslationZ: properties.cameraTranslationZ ?? 0,
        cameraEulerRotationX: properties.cameraEulerRotationX ?? 0,
        cameraEulerRotationY: properties.cameraEulerRotationY ?? 0,
        cameraEulerRotationZ: properties.cameraEulerRotationZ ?? 0,
        modelOptions: [],
        image360CollectionOptions: [],
        groundPlanes: [],
        skybox: skyboxObject,
        qualitySettings: {
          cadBudget: properties.cadBudget,
          pointCloudBudget: properties.pointCloudBudget,
          maxRenderResolution: properties.maxRenderResolution,
          movingCameraResolutionFactor: properties.movingCameraResolutionFactor,
          pointCloudPointSize: properties.pointCloudPointSize,
          pointCloudPointShape: properties.pointCloudPointShape,
          pointCloudColor: properties.pointCloudColor
        }
      };
    }

    return acc;
  }, {});
}

function populateSceneMapWithModels(
  sceneModels: Array<EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>>>,
  scenesMap: Record<Space, Record<ExternalId, SceneData>>,
  tryGetModelIdFromExternalId: (externalId: string) => number | undefined
): void {
  sceneModels.forEach((edge) => {
    const { space, externalId } = edge.startNode;

    const properties = Object.values(Object.values(edge.properties)[0])[0];

    const newModelId = tryGetModelIdFromExternalId(edge.endNode.externalId);
    const newModelRevisionId = Number(properties?.revisionId);

    if (newModelId === undefined || isNaN(newModelRevisionId)) {
      return;
    }

    if (scenesMap[space]?.[externalId] === undefined) {
      return;
    }

    const transform = createTransformFromEdge(properties);
    const newModel = {
      modelId: newModelId,
      revisionId: newModelRevisionId,
      transformation: transform
    };

    scenesMap[space]?.[externalId].modelOptions.push(newModel);
  });
}

function populateSceneMapWith360Images(
  scene360Images: Array<
    EdgeItem<Record<string, Record<string, Cdf3dImage360CollectionProperties>>>
  >,
  scenesMap: Record<Space, Record<ExternalId, SceneData>>
): void {
  scene360Images.forEach((edge) => {
    const { space, externalId } = edge.startNode;

    if (scenesMap[space]?.[externalId] === undefined) {
      return;
    }

    const properties = Object.values(Object.values(edge.properties)[0])[0];
    const transform = createTransformFromEdge(properties);
    const newImage360Collection: AddImage360CollectionDatamodelsOptions = {
      source: 'dm',
      externalId: properties.image360CollectionExternalId,
      space: properties.image360CollectionSpace,
      transform
    };

    scenesMap[space]?.[externalId].image360CollectionOptions.push(newImage360Collection);
  });
}

function populateSceneMapWithGroundplanes(
  sceneGroundPlanes: Array<NodeItem<GroundPlaneProperties>>,
  sceneGroundPlaneEdges: Array<EdgeItem<Record<string, Record<string, Transformation3d>>>>,
  scenesMap: Record<Space, Record<ExternalId, SceneData>>
): void {
  sceneGroundPlaneEdges.forEach((edge) => {
    const { space, externalId } = edge.startNode;

    const mappedGroundPlane = sceneGroundPlanes.find(
      (groundPlane) =>
        groundPlane.externalId === edge.endNode.externalId &&
        groundPlane.space === edge.endNode.space
    );

    if (scenesMap[space]?.[externalId] === undefined || mappedGroundPlane === undefined) {
      return;
    }

    const groundPlaneEdgeProperties = Object.values(Object.values(edge.properties)[0])[0];
    const groundPlaneProperties = Object.values(Object.values(mappedGroundPlane.properties)[0])[0];

    const groundPlane: GroundPlane = {
      label: groundPlaneProperties.label,
      file: groundPlaneProperties.file,
      wrapping: groundPlaneProperties.wrapping,
      repeatU: groundPlaneProperties.repeatU ?? 1,
      repeatV: groundPlaneProperties.repeatV ?? 1,
      ...groundPlaneEdgeProperties
    };

    scenesMap[space]?.[externalId].groundPlanes.push(groundPlane);
  });
}

function createTransformFromEdge(properties: Transformation3d): Matrix4 {
  const transform = new Matrix4();

  transform.makeRotationFromEuler(
    new Euler(
      MathUtils.degToRad(properties.eulerRotationX),
      MathUtils.degToRad(properties.eulerRotationY),
      MathUtils.degToRad(properties.eulerRotationZ)
    )
  );

  fixModelScale(properties);

  const scaleMatrix = new Matrix4().makeScale(
    properties.scaleX,
    properties.scaleY,
    properties.scaleZ
  );
  transform.multiply(scaleMatrix);

  const translation = new Matrix4().makeTranslation(
    properties.translationX,
    properties.translationY,
    properties.translationZ
  );
  transform.premultiply(translation);

  transform.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

  return transform;
}

function fixModelScale(modelProps: Transformation3d): Transformation3d {
  if (modelProps.scaleX === 0) {
    modelProps.scaleX = 1;
  }
  if (modelProps.scaleY === 0) {
    modelProps.scaleY = 1;
  }
  if (modelProps.scaleZ === 0) {
    modelProps.scaleZ = 1;
  }

  return modelProps;
}
