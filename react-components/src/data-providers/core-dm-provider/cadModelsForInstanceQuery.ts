/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk/dist/src';
import { cogniteCadNodeSourceWithProperties } from './cogniteCadNodeSourceWithProperties';
import { COGNITE_CAD_NODE_SOURCE, COGNITE_VISUALIZABLE_SOURCE } from './dataModels';

export const cadModelsForInstanceQuery = {
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
