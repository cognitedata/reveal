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
const getAllScenesQuery = (
  limit: number = SCENE_QUERY_LIMIT,
  cursors?: SceneCursors
): {
  readonly cursors?: SceneCursors | undefined;
  readonly with: {
    readonly scenes: {
      readonly nodes: {
        readonly filter: {
          readonly hasData: [
            {
              readonly type: 'view';
              readonly space: 'scene';
              readonly externalId: 'SceneConfiguration';
              readonly version: 'v1';
            }
          ];
        };
      };
      readonly limit: number;
    };
    readonly sceneModels: {
      readonly edges: {
        readonly from: 'scenes';
        readonly maxDistance: 1;
        readonly direction: 'outwards';
        readonly filter: {
          readonly equals: {
            readonly property: ['edge', 'type'];
            readonly value: {
              readonly space: 'scene';
              readonly externalId: 'SceneConfiguration.model3ds';
            };
          };
        };
      };
      readonly limit: 10000;
    };
    readonly scene360Collections: {
      readonly edges: {
        readonly from: 'scenes';
        readonly maxDistance: 1;
        readonly direction: 'outwards';
        readonly filter: {
          readonly equals: {
            readonly property: ['edge', 'type'];
            readonly value: {
              readonly space: 'scene';
              readonly externalId: 'SceneConfiguration.images360Collections';
            };
          };
        };
      };
      readonly limit: 10000;
    };
    readonly sceneSkybox: {
      readonly nodes: {
        readonly from: 'scenes';
        readonly through: {
          readonly view: {
            readonly type: 'view';
            readonly space: 'scene';
            readonly externalId: 'SceneConfiguration';
            readonly version: 'v1';
          };
          readonly identifier: 'skybox';
        };
        readonly direction: 'outwards';
      };
      readonly limit: 10000;
    };
    readonly sceneGroundPlaneEdges: {
      readonly edges: {
        readonly from: 'scenes';
        readonly maxDistance: 1;
        readonly direction: 'outwards';
        readonly filter: {
          readonly equals: {
            readonly property: ['edge', 'type'];
            readonly value: {
              readonly space: 'scene';
              readonly externalId: 'SceneConfiguration.texturedGroundPlanes';
            };
          };
        };
      };
      readonly limit: 10000;
    };
    readonly sceneGroundPlanes: {
      readonly nodes: {
        readonly from: 'sceneGroundPlaneEdges';
        readonly chainTo: 'destination';
      };
      readonly limit: 10000;
    };
  };
  readonly select: {
    readonly scenes: {
      readonly sources: [
        {
          readonly source: {
            readonly type: 'view';
            readonly space: 'scene';
            readonly externalId: 'SceneConfiguration';
            readonly version: 'v1';
          };
          readonly properties: ['*'];
        }
      ];
    };
    readonly sceneModels: {
      readonly sources: [
        {
          readonly source: {
            readonly type: 'view';
            readonly space: 'scene';
            readonly externalId: 'RevisionProperties';
            readonly version: 'v1';
          };
          readonly properties: ['*'];
        }
      ];
    };
    readonly scene360Collections: {
      readonly sources: [
        {
          readonly source: {
            readonly type: 'view';
            readonly space: 'scene';
            readonly externalId: 'Image360CollectionProperties';
            readonly version: 'v1';
          };
          readonly properties: ['*'];
        }
      ];
    };
    readonly sceneSkybox: {
      readonly sources: [
        {
          readonly source: {
            readonly type: 'view';
            readonly space: 'scene';
            readonly externalId: 'EnvironmentMap';
            readonly version: 'v1';
          };
          readonly properties: ['label', 'file', 'isSpherical'];
        }
      ];
    };
    readonly sceneGroundPlaneEdges: {
      readonly sources: [
        {
          readonly source: {
            readonly type: 'view';
            readonly space: 'cdf_3d_schema';
            readonly externalId: 'Transformation3d';
            readonly version: 'v1';
          };
          readonly properties: [
            'translationX',
            'translationY',
            'translationZ',
            'eulerRotationX',
            'eulerRotationY',
            'eulerRotationZ',
            'scaleX',
            'scaleY',
            'scaleZ'
          ];
        }
      ];
    };
    readonly sceneGroundPlanes: {
      readonly sources: [
        {
          readonly source: {
            readonly type: 'view';
            readonly space: 'scene';
            readonly externalId: 'TexturedPlane';
            readonly version: 'v1';
          };
          readonly properties: ['file', 'label', 'wrapping', 'repeatU', 'repeatV'];
        }
      ];
    };
  };
} => {
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
  const cleanedCursors: SceneCursors = {};
  if (cursors?.scenes !== undefined) {
    cleanedCursors.scenes = cursors.scenes;
  }
  if (cursors?.sceneModels !== undefined) {
    cleanedCursors.sceneModels = cursors.sceneModels;
  }
  if (cursors?.scene360Collections !== undefined) {
    cleanedCursors.scene360Collections = cursors.scene360Collections;
  }

  const finalCursors = Object.keys(cleanedCursors).length > 0 ? cleanedCursors : undefined;
  return getAllScenesQuery(limit, finalCursors);
}
