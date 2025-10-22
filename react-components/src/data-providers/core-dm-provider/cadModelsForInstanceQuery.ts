import { type QueryRequest } from '@cognite/sdk';
import { cogniteCadNodeSourceWithProperties } from './cogniteCadNodeSourceWithProperties';
import { COGNITE_CAD_NODE_SOURCE, COGNITE_VISUALIZABLE_SOURCE } from './dataModels';

export const cadModelsForInstanceQuery: {
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
        readonly cad_nodes: {
            readonly nodes: {
                readonly from: "object_3ds";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteCADNode";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
            };
        };
    }; readonly select: {
        readonly cad_nodes: {
            readonly sources: [{
                readonly source: {
                    readonly externalId: "CogniteCADNode";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                readonly properties: ["name", "description", "tags", "aliases", "object3D", "model3D", "cadNodeReference", "revisions", "treeIndexes", "subTreeSizes"];
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
    cad_nodes: {
      nodes: {
        from: 'object_3ds',
        through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' }
      }
    }
  },
  select: {
    cad_nodes: { sources: cogniteCadNodeSourceWithProperties }
  }
} as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;
