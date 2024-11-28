/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk';
import { COGNITE_3D_REVISION_SOURCE, CORE_DM_3D_CONTAINER_SPACE } from './dataModels';
import { cogniteCadRevisionSourceWithProperties } from './cogniteCadRevisionSourceWithProperties';

export const revisionQuery = {
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
