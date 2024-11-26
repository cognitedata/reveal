/*!
 * Copyright 2024 Cognite AS
 */

import { type QueryRequest } from '@cognite/sdk';
import { COGNITE_3D_REVISION_SOURCE } from '../../data-providers/core-dm-provider/dataModels';
import { getNodeExternalIdEqualsFilter, getNodeSpaceEqualsFilter } from './utils';
import { type FdmSDK } from '../../data-providers/FdmSDK';

type Cognite3DRevisionProperties = {
  model3D: { externalId: string; space: string };
};

export async function getModelIdAndRevisionIdFromExternalId(
  revisionExternalId: string,
  space: string,
  fdmSdk: FdmSDK
): Promise<{ modelId: number; revisionId: number }> {
  const query = getModelIdQuery(revisionExternalId, space);
  const result = await fdmSdk.queryNodesAndEdges(query);
  if (result.items.revision.length === 0) {
    throw new Error(`No revision view found for external ID ${revisionExternalId}`);
  }
  const revisionProperties = result.items.revision[0].properties.cdf_cdm[
    'Cognite3DRevision/v1'
  ] as Cognite3DRevisionProperties;
  const modelExternalId = revisionProperties.model3D.externalId;

  const modelId = extractNumericId(modelExternalId);
  const revisionId = extractNumericId(revisionExternalId);

  if (modelId === undefined || revisionId === undefined) {
    throw new Error(
      `No numeric ID found in external ID ${modelExternalId} or ${revisionExternalId}`
    );
  }

  return { modelId, revisionId };
}

function extractNumericId(externalId: string): number | undefined {
  const lastUnderscoreIndex = externalId.lastIndexOf('_');
  if (lastUnderscoreIndex === -1) {
    return undefined;
  }
  const numericPart = externalId.slice(lastUnderscoreIndex + 1);
  return numericPart.length > 0 && !isNaN(Number(numericPart))
    ? parseInt(numericPart, 10)
    : undefined;
}

function getModelIdQuery(revisionExternalId: string, space: string): QueryRequest {
  return {
    with: {
      revision: {
        nodes: {
          filter: {
            and: [
              getNodeExternalIdEqualsFilter(revisionExternalId),
              getNodeSpaceEqualsFilter(space)
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
            source: COGNITE_3D_REVISION_SOURCE,
            properties: ['model3D']
          }
        ]
      }
    }
  };
}
