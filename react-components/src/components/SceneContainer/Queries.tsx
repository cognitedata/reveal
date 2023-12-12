/*!
 * Copyright 2023 Cognite AS
 */

import { type Query } from '../../utilities/FdmSDK';

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
                space: 'scene_space',
                externalId: 'SceneConfiguration.cdf3dModels'
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
                space: 'scene_space',
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
              space: 'scene_space',
              externalId: 'SceneConfiguration',
              version: 'v4'
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
      myScene: {
        sources: [
          {
            source: {
              type: 'view',
              space: 'scene_space',
              externalId: 'SceneConfiguration',
              version: 'v4'
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
              space: 'scene_space',
              externalId: 'Cdf3dRevisionProperties',
              version: '2190c9b6f5cb82'
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
              space: 'scene_space',
              externalId: 'Cdf3dImage360CollectionProperties2',
              version: 'c29eeaabf97bf9'
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
              space: 'scene_space',
              externalId: 'EnvironmentMap',
              version: 'c7574a9083b304'
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
              space: 'scene_space',
              externalId: 'Cdf3dImage360Properties',
              version: '27ff998bf60c1c'
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
              space: 'scene_space',
              externalId: 'TexturedPlane',
              version: '94f0d07f55b20b'
            },
            properties: ['label', 'file', 'wrapping']
          }
        ]
      }
    }
  };
}
