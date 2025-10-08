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
import { type DmsUniqueIdentifier } from '../../data-providers';

export type ScenesQuery = ReturnType<typeof getAllScenesQuery>;

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const getAllScenesQuery = (limit: number = SCENE_QUERY_LIMIT, sceneCursor?: string) => {
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
    cursors: sceneCursor !== undefined ? { scenes: sceneCursor } : undefined
  } as const satisfies Omit<QueryRequest, 'parameters'>;
};

export function createGetScenesQuery(
  limit: number = SCENE_QUERY_LIMIT,
  sceneCursor?: string
): ScenesQuery {
  return getAllScenesQuery(limit, sceneCursor);
}

export function createGetSceneModelsQuery(sceneIds: DmsUniqueIdentifier[], cursor?: string) {
  return {
    with: {
      sceneModels: {
        edges: {
          filter: {
            and: [
              {
                equals: {
                  property: ['edge', 'type'],
                  value: {
                    space: 'scene',
                    externalId: 'SceneConfiguration.model3ds'
                  }
                }
              },
              {
                in: {
                  property: ['edge', 'startNode'],
                  values: sceneIds
                }
              }
            ]
          }
        },
        limit: SCENE_RELATED_DATA_LIMIT
      }
    },
    select: {
      sceneModels: {
        sources: revisionSourceWithProperties
      }
    },
    cursors: cursor !== undefined ? { sceneModels: cursor } : undefined
  } as const satisfies Omit<QueryRequest, 'parameters'>;
}

export function createGetScene360CollectionsQuery(
  sceneIds: DmsUniqueIdentifier[],
  cursor?: string
) {
  return {
    with: {
      scene360Collections: {
        edges: {
          filter: {
            and: [
              {
                equals: {
                  property: ['edge', 'type'],
                  value: {
                    space: 'scene',
                    externalId: 'SceneConfiguration.images360Collections'
                  }
                }
              },
              {
                in: {
                  property: ['edge', 'startNode'],
                  values: sceneIds
                }
              }
            ]
          }
        },
        limit: SCENE_RELATED_DATA_LIMIT
      }
    },
    select: {
      scene360Collections: {
        sources: image360CollectionSourceWithProperties
      }
    },
    cursors: cursor !== undefined ? { scene360Collections: cursor } : undefined
  } as const satisfies Omit<QueryRequest, 'parameters'>;
}
