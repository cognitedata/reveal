import { type QueryRequest } from '@cognite/sdk';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';
import { cogniteCadNodeSourceWithProperties } from './cogniteCadNodeSourceWithProperties';
import {
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';

export const cadConnectionsQuery: {
  readonly with: {
    readonly cad_nodes: {
      readonly nodes: {
        readonly filter: {
          readonly and: [
            {
              readonly in: {
                readonly property: ['cdf_cdm_3d', 'CogniteCADNode', 'model3D'];
                readonly values: {
                  readonly parameter: 'modelRefs';
                };
              };
            },
            {
              readonly containsAny: {
                readonly property: ['cdf_cdm_3d', 'CogniteCADNode', 'revisions'];
                readonly values: {
                  readonly parameter: 'revisionRefs';
                };
              };
            }
          ];
        };
      };
      readonly limit: 10000;
    };
    readonly object_3ds: {
      readonly nodes: {
        readonly from: 'cad_nodes';
        readonly through: {
          readonly view: {
            readonly externalId: 'CogniteCADNode';
            readonly space: 'cdf_cdm';
            readonly version: 'v1';
            readonly type: 'view';
          };
          readonly identifier: 'object3D';
        };
        readonly direction: 'outwards';
        readonly filter: {
          readonly hasData: [
            {
              readonly externalId: 'Cognite3DObject';
              readonly space: 'cdf_cdm';
              readonly version: 'v1';
              readonly type: 'view';
            }
          ];
        };
      };
      readonly limit: 10000;
    };
    readonly assets: {
      readonly nodes: {
        readonly from: 'object_3ds';
        readonly through: {
          readonly view: {
            readonly externalId: 'CogniteAsset';
            readonly space: 'cdf_cdm';
            readonly version: 'v1';
            readonly type: 'view';
          };
          readonly identifier: 'object3D';
        };
        readonly direction: 'inwards';
      };
      readonly limit: 10000;
    };
  };
  readonly select: {
    readonly cad_nodes: {
      readonly sources: [
        {
          readonly source: {
            readonly externalId: 'CogniteCADNode';
            readonly space: 'cdf_cdm';
            readonly version: 'v1';
            readonly type: 'view';
          };
          readonly properties: [
            'name',
            'description',
            'tags',
            'aliases',
            'object3D',
            'model3D',
            'cadNodeReference',
            'revisions',
            'treeIndexes',
            'subTreeSizes'
          ];
        }
      ];
    };
    readonly assets: {
      readonly sources: [
        {
          readonly source: {
            readonly externalId: 'CogniteAsset';
            readonly space: 'cdf_cdm';
            readonly version: 'v1';
            readonly type: 'view';
          };
          readonly properties: [
            'name',
            'description',
            'tags',
            'aliases',
            'object3D',
            'sourceId',
            'sourceContext',
            'source',
            'sourceCreatedTime',
            'sourceUpdatedTime',
            'sourceCreatedUser',
            'sourceUpdatedUser',
            'parent',
            'root',
            'path',
            'pathLastUpdatedTime',
            'equipment',
            'assetClass',
            'type',
            'files',
            'children',
            'activities',
            'timeSeries'
          ];
        }
      ];
    };
  };
} = {
  with: {
    cad_nodes: {
      nodes: {
        filter: {
          and: [
            {
              in: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'model3D'
                ],
                values: { parameter: 'modelRefs' }
              }
            },
            {
              containsAny: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_CAD_NODE_SOURCE.externalId,
                  'revisions'
                ],
                values: { parameter: 'revisionRefs' }
              }
            }
          ]
        }
      },
      limit: 10000
    },
    object_3ds: {
      nodes: {
        from: 'cad_nodes',
        through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
        direction: 'outwards',
        filter: {
          hasData: [COGNITE_3D_OBJECT_SOURCE]
        }
      },
      limit: 10000
    },
    assets: {
      nodes: {
        from: 'object_3ds',
        through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
        direction: 'inwards'
      },
      limit: 10000
    }
  },
  select: {
    cad_nodes: { sources: cogniteCadNodeSourceWithProperties },
    assets: { sources: cogniteAssetSourceWithProperties }
  }
} as const satisfies Omit<QueryRequest, 'cursor' | 'parameters'>;
