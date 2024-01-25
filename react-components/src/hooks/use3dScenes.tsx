/*!
 * Copyright 2023 Cognite AS
 */

import { type QueryFunction, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { useMemo } from 'react';
import { type EdgeItem, FdmSDK, type Query } from '../utilities/FdmSDK';
import { type AddReveal3DModelOptions } from '..';
import { type SceneConfigurationProperties, type Cdf3dRevisionProperties } from './types';
import { Euler, MathUtils, Matrix4 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

export type Space = string;
export type ExternalId = string;

export type SceneData = {
  name: string;
  modelOptions: AddReveal3DModelOptions[];
};

export const use3dScenes = (
  userSdk?: CogniteClient
): UseQueryResult<Record<Space, Record<ExternalId, SceneData>>> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const queryFunction: QueryFunction<Record<Space, Record<ExternalId, SceneData>>> = async () => {
    const scenesQuery = createGetScenesQuery();

    try {
      const scenesQueryResult = await fdmSdk.queryNodesAndEdges(scenesQuery);

      const scenesMap: Record<
        Space,
        Record<ExternalId, SceneData>
      > = scenesQueryResult.items.sceneModels.reduce(
        (acc, item) => {
          const edge = item as EdgeItem;

          const { space, externalId } = edge.startNode;

          const properties = Object.values(
            Object.values(edge.properties)[0] as Record<string, unknown>
          )[0] as Cdf3dRevisionProperties;

          const newModelId = Number(edge.endNode.externalId);
          const newModelRevisionId = Number(properties?.revisionId);

          if (isNaN(newModelId) || isNaN(newModelRevisionId)) {
            return acc;
          }

          const newModel = createModelFromEdge(newModelId, newModelRevisionId, properties);

          if (acc[space] === undefined) {
            acc[space] = {};
          }
          const spaceMap = acc[space];

          if (spaceMap[externalId] === undefined) {
            spaceMap[externalId] = { name: '', modelOptions: [] };
          }
          const externalIdMap = spaceMap[externalId];
          externalIdMap.modelOptions.push(newModel);

          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {} as Record<Space, Record<ExternalId, SceneData>>
      );

      scenesQueryResult.items.scenes.forEach((scene) => {
        const { space, externalId } = scene;

        if (scenesMap[space]?.[externalId] !== undefined) {
          const properties = Object.values(
            Object.values(scene.properties)[0] as Record<string, unknown>
          )[0] as SceneConfigurationProperties;
          scenesMap[space][externalId].name = properties.name;
        }
      });

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

function createModelFromEdge(
  newModelId: number,
  newModelRevisionId: number,
  properties: Cdf3dRevisionProperties
): AddReveal3DModelOptions {
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

  return {
    modelId: newModelId,
    revisionId: newModelRevisionId,
    transform
  };
}

function fixModelScale(modelProps: Cdf3dRevisionProperties): Cdf3dRevisionProperties {
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
      }
    }
  };
}
