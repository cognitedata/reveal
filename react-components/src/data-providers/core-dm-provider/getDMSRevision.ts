/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk/dist/src';
import { type DmsUniqueIdentifier, type FdmSDK, type NodeItem } from '../FdmSDK';
import { COGNITE_CAD_REVISION_SOURCE, type CogniteCADRevisionProperties } from './dataModels';

export async function getDMSRevision(
  model: DmsUniqueIdentifier,
  revisionId: number,
  fdmSdk: FdmSDK
): Promise<NodeItem<CogniteCADRevisionProperties>> {
  const query = {
    ...cadConnectionQuery,
    parameters: { modelReference: model, revisionId }
  } as const satisfies QueryRequest;

  const result = await fdmSdk.queryNodesAndEdges<
    typeof cadConnectionQuery,
    [{ source: typeof COGNITE_CAD_REVISION_SOURCE; properties: CogniteCADRevisionProperties }]
  >(query);

  if (result.items.revision.length === 0) {
    throw new Error(
      `No revision found for ID ${revisionId} on model ${model.space}, ${model.externalId}`
    );
  }

  return result.items.revision[0];
}

const cadConnectionQuery = {
  with: {
    revision: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: [
                  COGNITE_CAD_REVISION_SOURCE.space,
                  COGNITE_CAD_REVISION_SOURCE.externalId,
                  'model3D'
                ],
                value: { parameter: 'modelReference' }
              }
            },
            {
              in: {
                property: [
                  COGNITE_CAD_REVISION_SOURCE.space,
                  COGNITE_CAD_REVISION_SOURCE.externalId,
                  'revisionId'
                ],
                values: { parameter: 'nodeIds' }
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
      sources: [
        {
          source: COGNITE_CAD_REVISION_SOURCE,
          properties: ['status', 'publish', 'type', 'model3D', 'revisionId']
        }
      ]
    }
  }
} as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;
