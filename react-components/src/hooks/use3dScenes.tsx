/*!
 * Copyright 2023 Cognite AS
 */

import { type QueryFunction, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { useMemo } from 'react';
import { type EdgeItem, FdmSDK, type Query, type NodeItem } from '../utilities/FdmSDK';
import { type AddReveal3DModelOptions } from '..';
import {
  type SceneConfigurationProperties,
  type Cdf3dRevisionProperties,
  type Transformation3d,
  type Cdf3dImage360CollectionProperties
} from './types';
import { Euler, MathUtils, Matrix4 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type AddImageCollection360DatamodelsOptions } from '../components/Reveal3DResources/types';

export type Space = string;
export type ExternalId = string;

export type SceneData = {
  name: string;
  cadModelOptions: AddReveal3DModelOptions[];
  image360CollectionOptions: AddImageCollection360DatamodelsOptions[];
};

type Use3dScenesQueryResult = {
  scenes: Array<NodeItem<SceneConfigurationProperties>>;
  sceneModels: Array<EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>>>;
  scene360Collections: Array<
    EdgeItem<Record<string, Record<string, Cdf3dImage360CollectionProperties>>>
  >;
};

export const use3dScenes = (
  userSdk?: CogniteClient
): UseQueryResult<Record<Space, Record<ExternalId, SceneData>>> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const queryFunction: QueryFunction<Record<Space, Record<ExternalId, SceneData>>> = async () => {
    const scenesQuery = createGetScenesQuery();

    try {
      const queryResult = await fdmSdk.queryNodesAndEdges(scenesQuery);

      const use3dScenesQueryResult: Use3dScenesQueryResult = {
        scenes: queryResult.items.scenes as Array<NodeItem<SceneConfigurationProperties>>,
        sceneModels: queryResult.items.sceneModels as Array<
          EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>>
        >,
        scene360Collections: queryResult.items.scene360Collections as Array<
          EdgeItem<Record<string, Record<string, Cdf3dImage360CollectionProperties>>>
        >
      };

      const scenesMap = createMapOfScenes(use3dScenesQueryResult.scenes);
      populateSceneMapWithModels(use3dScenesQueryResult.sceneModels, scenesMap);
      populateSceneMapWith360Images(use3dScenesQueryResult.scene360Collections, scenesMap);

      return scenesMap;
    } catch (error) {
      console.warn("Scene space doesn't exist or has no scenes with 3D models");
      return {};
    }
  };

  return useQuery<Record<Space, Record<ExternalId, SceneData>>>(
    ['reveal-react-components', 'cdf', '3d', 'scenes'],
    queryFunction
  );
};

function createMapOfScenes(
  scenes: Array<NodeItem<SceneConfigurationProperties>>
): Record<Space, Record<ExternalId, SceneData>> {
  return scenes.reduce(
    (
      acc: Record<Space, Record<ExternalId, SceneData>>,
      scene: NodeItem<SceneConfigurationProperties>
    ) => {
      const { space, externalId } = scene;
      const properties = Object.values(Object.values(scene.properties)[0])[0];
      if (acc[space] === undefined) {
        acc[space] = {};
      }
      if (acc[space][externalId] === undefined) {
        acc[space][externalId] = {
          name: properties.name,
          cadModelOptions: [],
          image360CollectionOptions: []
        };
      }

      return acc;
    },
    {}
  );
}

function populateSceneMapWithModels(
  scene360Images: Array<EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>>>,
  scenesMap: Record<Space, Record<ExternalId, SceneData>>
): void {
  scene360Images.forEach((edge) => {
    const { space, externalId } = edge.startNode;

    const properties = Object.values(Object.values(edge.properties)[0])[0];

    const newModelId = Number(edge.endNode.externalId);
    const newModelRevisionId = Number(properties?.revisionId);

    if (isNaN(newModelId) || isNaN(newModelRevisionId)) {
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

    scenesMap[space]?.[externalId].cadModelOptions.push(newModel);
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

    const properties = Object.values(Object.values(edge.properties)[0])[0];

    if (scenesMap[space]?.[externalId] === undefined) {
      return;
    }

    const newImage360Collection: AddImageCollection360DatamodelsOptions = {
      externalId: properties.image360CollectionExternalId,
      space: properties.image360CollectionSpace
    };

    scenesMap[space]?.[externalId].image360CollectionOptions.push(newImage360Collection);
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

function createGetScenesQuery(limit: number = 100): Query {
  return {
    with: {
      scenes: {
        nodes: {
          filter: {
            hasData: [
              {
                type: 'view',
                space: 'scene',
                externalId: 'SceneConfiguration',
                version: 'v1'
              }
            ]
          }
        },
        limit
      },
      sceneModels: {
        edges: {
          from: 'scenes',
          maxDistance: 1,
          direction: 'outwards',
          filter: {
            equals: {
              property: ['edge', 'type'],
              value: {
                space: 'scene',
                externalId: 'SceneConfiguration.model3ds'
              }
            }
          }
        },
        limit
      },
      scene360Collections: {
        edges: {
          from: 'scenes',
          maxDistance: 1,
          direction: 'outwards',
          filter: {
            equals: {
              property: ['edge', 'type'],
              value: {
                space: 'scene',
                externalId: 'SceneConfiguration.images360Collections'
              }
            }
          }
        },
        limit
      }
    },
    select: {
      scenes: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'SceneConfiguration',
              version: 'v1'
            },
            properties: [
              'name',
              'cameraTranslationX',
              'cameraTranslationY',
              'cameraTranslationZ',
              'cameraEulerRotationX',
              'cameraEulerRotationY',
              'cameraEulerRotationZ'
            ]
          }
        ]
      },
      sceneModels: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'RevisionProperties',
              version: 'v1'
            },
            properties: ['*']
          }
        ]
      },
      scene360Collections: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'Image360CollectionProperties',
              version: 'v1'
            },
            properties: ['*']
          }
        ]
      }
    }
  };
}
