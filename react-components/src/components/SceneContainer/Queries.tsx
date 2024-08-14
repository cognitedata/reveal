/*!
 * Copyright 2023 Cognite AS
 */

import { type Query } from '../../data-providers/FdmSDK';

export function createGetSceneQuery(sceneExternalId: string, sceneSpaceId: string): Query {
  return {
    with: {
      myScene: {
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
          from: 'myScene',
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
        limit: 100
      },
      image360CollectionsEdges: {
        edges: {
          from: 'myScene',
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
        limit: 100
      },
      skybox: {
        nodes: {
          from: 'myScene',
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
        }
      },
      groundPlaneEdges: {
        edges: {
          from: 'myScene',
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
      myScene: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'SceneConfiguration',
              version: 'v1'
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
              space: 'scene',
              externalId: 'RevisionProperties',
              version: 'v1'
            },
            properties: [
              'revisionId',
              'translationX',
              'translationY',
              'translationZ',
              'eulerRotationX',
              'eulerRotationY',
              'eulerRotationZ',
              'scaleX',
              'scaleY',
              'scaleZ'
            ]
          }
        ]
      },
      image360CollectionsEdges: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'Image360CollectionProperties',
              version: 'v1'
            },
            properties: [
              'image360CollectionExternalId',
              'image360CollectionSpace',
              'translationX',
              'translationY',
              'translationZ',
              'eulerRotationX',
              'eulerRotationY',
              'eulerRotationZ',
              'scaleX',
              'scaleY',
              'scaleZ'
            ]
          }
        ]
      },
      skybox: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'EnvironmentMap',
              version: 'v1'
            },
            properties: ['label', 'file', 'isSpherical']
          }
        ]
      },
      groundPlaneEdges: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'cdf_3d_schema',
              externalId: 'Transformation3d',
              version: 'v1'
            },
            properties: [
              'translationX',
              'translationY',
              'translationZ',
              'eulerRotationX',
              'eulerRotationY',
              'eulerRotationZ',
              'scaleX',
              'scaleY',
              'scaleZ'
            ]
          }
        ]
      },
      groundPlanes: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene',
              externalId: 'TexturedPlane',
              version: 'v1'
            },
            properties: ['*']
          }
        ]
      }
    }
  };
}
