/*!
 * Copyright 2023 Cognite AS
 */

import { type QueryFunction, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { useMemo } from 'react';
import { type EdgeItem, FdmSDK, type Query } from '../utilities/FdmSDK';
import { type AddReveal3DModelOptions } from '..';
import { type Cdf3dRevisionProperties } from './types';
import { Euler, MathUtils, Matrix4 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

export type Scene3DModel = {
  externalId: string;
  space: string;
  addModelOptions: AddReveal3DModelOptions[];
};

export const use3dScenes = (
  userSdk?: CogniteClient
): UseQueryResult<Record<string, Scene3DModel>> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const queryFunction: QueryFunction<Record<string, Scene3DModel>> = async () => {
    const scenesQuery = createGetScenesQuery();

    try {
      const scenesQueryResult = await fdmSdk.queryNodesAndEdges(scenesQuery);

      const sceneList: Scene3DModel[] = [];
      scenesQueryResult.items.sceneModels.forEach(
        (item) => {
          const edge = item as EdgeItem;

          const { externalId, space } = edge.startNode;

          const properties = Object.values(
            Object.values(edge.properties)[0] as Record<string, unknown>
          )[0] as Cdf3dRevisionProperties;
          const sceneModel = sceneList.find(
            (scene) => scene.externalId === externalId && scene.space === space
          );

          const newModelId = Number(edge.endNode.externalId);
          const newModelRevisionId = Number(properties?.revisionId);

          if (isNaN(newModelId) || isNaN(newModelRevisionId)) {
            return;
          }

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

          const newModel = {
            modelId: newModelId,
            revisionId: newModelRevisionId,
            transform
          };

          if (sceneModel !== undefined) {
            sceneModel.addModelOptions.push(newModel);
          } else {
            sceneList.push({
              externalId,
              space,
              addModelOptions: [newModel]
            });
          }
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {} as Scene3DModel[]
      );

      return sceneList.reduce<Record<string, Scene3DModel>>((acc, scene) => {
        acc[scene.externalId + '-' + scene.space] = scene;
        return acc;
      }, {});
    } catch (error) {
      console.warn("Scene space doesn't exist or has no scenes with 3D models");
      return {};
    }
  };

  return useQuery<Record<string, Scene3DModel>>(
    ['reveal-react-components', 'cdf', '3d', 'scenes'],
    queryFunction
  );
};

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
