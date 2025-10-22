import { type QueryRequest } from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_SOURCE, COGNITE_VISUALIZABLE_SOURCE } from './dataModels';

export const pointCloudModelsForInstanceQuery: {
    readonly with: {
        readonly asset: {
            readonly nodes: {
                readonly filter: {
                    readonly and: [{
                        readonly equals: {
                            readonly property: ["node", "externalId"];
                            readonly value: {
                                readonly parameter: "instanceExternalId";
                            };
                        };
                    }, {
                        readonly equals: {
                            readonly property: ["node", "space"];
                            readonly value: {
                                readonly parameter: "instanceSpace";
                            };
                        };
                    }];
                };
            };
        };
        readonly object_3ds: {
            readonly nodes: {
                readonly from: "asset";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteVisualizable";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "outwards";
            };
        };
        readonly pointcloud_volumes: {
            readonly nodes: {
                readonly from: "object_3ds";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CognitePointCloudVolume";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
            };
        };
    }; readonly select: {
        readonly pointcloud_volumes: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CognitePointCloudVolume";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["revisions"];
            }];
        };
    };
} = {
  with: {
    asset: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'instanceExternalId' }
              }
            },
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'instanceSpace' }
              }
            }
          ]
        }
      }
    },
    object_3ds: {
      nodes: {
        from: 'asset',
        through: {
          view: COGNITE_VISUALIZABLE_SOURCE,
          identifier: 'object3D'
        },
        direction: 'outwards'
      }
    },
    pointcloud_volumes: {
      nodes: {
        from: 'object_3ds',
        through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' }
      }
    }
  },
  select: {
    pointcloud_volumes: {
      sources: [
        {
          source: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
          properties: ['revisions']
        }
      ]
    }
  }
} as const satisfies QueryRequest;
