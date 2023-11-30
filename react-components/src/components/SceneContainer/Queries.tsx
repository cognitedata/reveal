/*!
 * Copyright 2023 Cognite AS
 */

import { type Query } from '../../utilities/FdmSDK';

export function createGetSceneQuery(sceneExternalId: string, sceneSpaceId: string): Query {
  return {
    with: {
      scene: {
        nodes: {
          filter: {
            and: [
              {
                equals: {
                  property: ['node', 'space'],
                  value: sceneSpaceId
                }
              },
              {
                equals: {
                  property: ['node', 'externalId'],
                  value: sceneExternalId
                }
              }
            ]
          }
        },
        limit: 1
      },
      sceneModels: {
        edges: {
          from: 'scene',
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
        limit: 100
      },
      skybox: {
        nodes: {
          from: 'scene',
          through: {
            view: {
              type: 'view',
              space: 'scene_space',
              externalId: 'SceneConfiguration',
              version: 'v4'
            },
            identifier: 'skybox'
          }
        }
      },
      groundPlaneEdges: {
        edges: {
          from: 'scene',
          maxDistance: 1,
          direction: 'outwards',
          filter: {
            equals: {
              property: ['edge', 'type'],
              value: {
                space: 'scene_space',
                externalId: 'SceneConfiguration.texturedGroundPlanes'
              }
            }
          }
        },
        limit: 100
      },
      groundPlanes: {
        nodes: {
          from: 'groundPlaneEdges',
          chainTo: 'destination'
        },
        limit: 100
      }
    },
    select: {
      scene: {
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
      },
      skybox: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene_space',
              externalId: 'EnvironmentMap',
              version: 'c7574a9083b304'
            },
            properties: ['*']
          }
        ]
      },
      groundPlaneEdges: {},
      groundPlanes: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene_space',
              externalId: 'TexturedPlane',
              version: '94f0d07f55b20b'
            },
            properties: ['*']
          }
        ]
      }
    }
  };
}
