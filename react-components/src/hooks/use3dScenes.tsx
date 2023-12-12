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
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

export const use3dScenes = (
  userSdk?: CogniteClient
): UseQueryResult<Record<string, AddReveal3DModelOptions[]>> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const queryFunction: QueryFunction<Record<string, AddReveal3DModelOptions[]>> = async () => {
    const scenesQuery = createGetScenesQuery();

    try {
      const scenesQueryResult = await fdmSdk.queryNodesAndEdges(scenesQuery);

      const scenesMap: Record<string, AddReveal3DModelOptions[]> =
        scenesQueryResult.items.sceneModels.reduce(
          (acc, item) => {
            const edge = item as EdgeItem;

            const { externalId } = edge.startNode;

            const properties = Object.values(
              Object.values(edge.properties)[0] as Record<string, unknown>
            )[0] as Cdf3dRevisionProperties;
            const sceneModels = acc[externalId];

            const newModelId = Number(edge.endNode.externalId);
            const newModelRevisionId = Number(properties?.revisionId);

            if (isNaN(newModelId) || isNaN(newModelRevisionId)) {
              return acc;
            }

            const newModel = {
              modelId: newModelId,
              revisionId: newModelRevisionId,
              transform: new Matrix4()
                .compose(
                  new Vector3(
                    properties.translationX,
                    properties.translationY,
                    properties.translationZ
                  ),
                  new Quaternion().setFromEuler(
                    new Euler(
                      properties.eulerRotationX,
                      properties.eulerRotationY,
                      properties.eulerRotationZ
                    )
                  ),
                  new Vector3(properties.scaleX, properties.scaleY, properties.scaleZ)
                )
                .premultiply(CDF_TO_VIEWER_TRANSFORMATION)
            };

            if (sceneModels !== undefined) {
              sceneModels.push(newModel);
            } else {
              acc[externalId] = [newModel];
            }

            return acc;
          },
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as Record<string, AddReveal3DModelOptions[]>
        );

      return scenesMap;
    } catch (error) {
      console.warn("Scene space doesn't exist or has no scenes with 3D models");
      return {};
    }
  };

  return useQuery<Record<string, AddReveal3DModelOptions[]>>(
    ['cdf', '3d', 'scenes'],
    queryFunction
  );
};

function createGetScenesQuery(limit: number = 100): Query {
  return {
    with: {
      scenes: {
        nodes: {
          filter: {
            hasData: [
              {
                type: 'view',
                space: 'scene_space',
                externalId: 'SceneConfiguration',
                version: 'v4'
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
                space: 'scene_space',
                externalId: 'SceneConfiguration.cdf3dModels'
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
              space: 'scene_space',
              externalId: 'SceneConfiguration',
              version: 'v4'
            },
            properties: ['*']
          }
        ]
      },
      sceneModels: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene_space',
              externalId: 'Cdf3dRevisionProperties',
              version: '2190c9b6f5cb82'
            },
            properties: ['*']
          }
        ]
      }
    }
  };
}
