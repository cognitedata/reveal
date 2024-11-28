/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';
import { cogniteCadNodeSourceWithProperties } from './cogniteCadNodeSourceWithProperties';
import {
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';

export const cadConnectionsQuery = {
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
