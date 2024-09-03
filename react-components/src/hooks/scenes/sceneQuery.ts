/*!
 * Copyright 2023 Cognite AS
 */

import { type QueryRequest } from '@cognite/sdk';
import {
  environmentMapSourceWithProperties,
  groundPlaneSourceWithProperties,
  image360CollectionSourceWithProperties,
  revisionSourceWithProperties,
  SCENE_SOURCE,
  sceneSourceWithProperties,
  transformationSourceWithProperties
} from '../../hooks/scenes/types';

export const sceneQuery = {
  with: {
    myScene: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'sceneSpace' }
              }
            },
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'sceneExternalId' }
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
          view: SCENE_SOURCE,
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
      sources: sceneSourceWithProperties
    },
    sceneModels: {
      sources: revisionSourceWithProperties
    },
    image360CollectionsEdges: {
      sources: image360CollectionSourceWithProperties
    },
    skybox: {
      sources: environmentMapSourceWithProperties
    },
    groundPlaneEdges: {
      sources: transformationSourceWithProperties
    },
    groundPlanes: {
      sources: groundPlaneSourceWithProperties
    }
  }
} as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;
