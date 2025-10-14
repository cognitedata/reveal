import { type QueryRequest } from '@cognite/sdk';
import {
  environmentMapSourceWithProperties,
  groundPlaneSourceWithProperties,
  image360CollectionSourceWithProperties,
  revisionSourceWithProperties,
  SCENE_QUERY_LIMIT,
  SCENE_RELATED_DATA_LIMIT,
  sceneSourceWithProperties,
  transformationSourceWithProperties
} from './types';

export type ScenesQuery = ReturnType<typeof getAllScenesQuery>;

export type SceneCursors = {
  scenes?: string;
  sceneModels?: string;
  scene360Collections?: string;
};

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const getAllScenesQuery = (limit: number = SCENE_QUERY_LIMIT, cursors?: SceneCursors) => {
  const query = {
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
        limit: SCENE_RELATED_DATA_LIMIT
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
        limit: SCENE_RELATED_DATA_LIMIT
      },
      sceneSkybox: {
        nodes: {
          from: 'scenes',
          through: {
            view: {
              type: 'view',
              space: 'scene',
              externalId: 'SceneConfiguration',
              version: 'v1'
            },
            identifier: 'skybox'
          },
          direction: 'outwards'
        },
        limit: SCENE_RELATED_DATA_LIMIT
      },
      sceneGroundPlaneEdges: {
        edges: {
          from: 'scenes',
          maxDistance: 1,
          direction: 'outwards',
          filter: {
            equals: {
              property: ['edge', 'type'],
              value: {
                space: 'scene',
                externalId: 'SceneConfiguration.texturedGroundPlanes'
              }
            }
          }
        },
        limit: SCENE_RELATED_DATA_LIMIT
      },
      sceneGroundPlanes: {
        nodes: {
          from: 'sceneGroundPlaneEdges',
          chainTo: 'destination'
        },
        limit: SCENE_RELATED_DATA_LIMIT
      }
    },
    select: {
      scenes: {
        sources: sceneSourceWithProperties
      },
      sceneModels: {
        sources: revisionSourceWithProperties
      },
      scene360Collections: {
        sources: image360CollectionSourceWithProperties
      },
      sceneSkybox: {
        sources: environmentMapSourceWithProperties
      },
      sceneGroundPlaneEdges: {
        sources: transformationSourceWithProperties
      },
      sceneGroundPlanes: {
        sources: groundPlaneSourceWithProperties
      }
    },
    ...(cursors !== undefined && { cursors })
  } as const satisfies Omit<QueryRequest, 'parameters'>;

  return query;
};

export function createGetScenesQuery(
  limit: number = SCENE_QUERY_LIMIT,
  cursors?: SceneCursors
): ScenesQuery {
  // Clean up undefined cursors so we don't send them in the request
  if (cursors?.scenes === undefined) delete cursors?.scenes;
  if (cursors?.sceneModels === undefined) delete cursors?.sceneModels;
  if (cursors?.scene360Collections === undefined) delete cursors?.scene360Collections;

  const finalCursors =
    cursors !== undefined && Object.keys(cursors).length > 0 ? cursors : undefined;
  return getAllScenesQuery(limit, finalCursors);
}
