/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk';
import { cogniteCadRevisionSourceWithProperties } from '../../data-providers/core-dm-provider/cogniteCadRevisionSourceWithProperties';
import {
  CORE_DM_3D_CONTAINER_SPACE,
  COGNITE_3D_REVISION_SOURCE
} from '../../data-providers/core-dm-provider/dataModels';

export const revisionModelQuery = {
  with: {
    revision: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: [
                  CORE_DM_3D_CONTAINER_SPACE,
                  COGNITE_3D_REVISION_SOURCE.externalId,
                  'model3D'
                ],
                value: { parameter: 'modelReference' }
              }
            },
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'revisionExternalId' }
              }
            }
          ]
        }
      },
      limit: 1
    }
  },
  select: {
    revision: {
      sources: cogniteCadRevisionSourceWithProperties
    }
  }
} as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;
