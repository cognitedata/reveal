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

export const sceneQuery: {
  readonly with: {
    readonly myScene: {
      readonly nodes: {
        readonly filter: {
          readonly and: [
            {
              readonly equals: {
                readonly property: ['node', 'space'];
                readonly value: {
                  readonly parameter: 'sceneSpace';
                };
              };
            },
            {
              readonly equals: {
                readonly property: ['node', 'externalId'];
                readonly value: {
                  readonly parameter: 'sceneExternalId';
                };
              };
            }
          ];
        };
      };
      readonly limit: 1;
    };
    readonly sceneModels: {
      readonly edges: {
        readonly from: 'myScene';
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
      readonly limit: 100;
    };
    readonly image360CollectionsEdges: {
      readonly edges: {
        readonly from: 'myScene';
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
      readonly limit: 100;
    };
    readonly skybox: {
      readonly nodes: {
        readonly from: 'myScene';
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
    };
    readonly groundPlaneEdges: {
      readonly edges: {
        readonly from: 'myScene';
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
      readonly limit: 100;
    };
    readonly groundPlanes: {
      readonly nodes: {
        readonly from: 'groundPlaneEdges';
        readonly chainTo: 'destination';
      };
      readonly limit: 100;
    };
  };
  readonly select: {
    readonly myScene: {
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
    readonly image360CollectionsEdges: {
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
    readonly skybox: {
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
    readonly groundPlaneEdges: {
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
    readonly groundPlanes: {
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
} = {
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
