/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { DataModelsSdk } from '../DataModelsSdk';
import { COGNITE_3D_REVISION_SOURCE } from '../utilities/constants';
import { getNodeExternalIdEqualsFilter, getNodeSpaceEqualsFilter } from '../utilities/utils';

type Cognite3DRevisionProperties = {
  model3D: { externalId: string; space: string };
};

export async function fetchDMModelIdFromRevisionId(
  revisionExternalId: string,
  space: string,
  sdk: CogniteClient | undefined
): Promise<{ modelId: number; revisionId: number }> {
  if (!sdk) {
    throw new Error('SDK is not defined');
  }

  const fdmSdk = new DataModelsSdk(sdk);
  const query = getModelIdQuery(revisionExternalId, space);
  const result = await fdmSdk.queryNodesAndEdges(query);
  if (result.revision.length === 0) {
    throw new Error(`No revision view found for external ID ${revisionExternalId}`);
  }
  const revisionProperties = result.revision[0].properties.cdf_cdm[
    'Cognite3DRevision/v1'
  ] as unknown as Cognite3DRevisionProperties;
  const modelExternalId = revisionProperties.model3D.externalId;

  const modelId = extractNumericId(modelExternalId);
  const revisionId = extractNumericId(revisionExternalId);

  if (modelId === null || revisionId === null) {
    throw new Error(`No numeric ID found in external ID ${modelExternalId} or ${revisionExternalId}`);
  }

  return { modelId, revisionId };
}

function extractNumericId(externalId: string): number | null {
  const lastUnderscoreIndex = externalId.lastIndexOf('_');
  if (lastUnderscoreIndex === -1) {
    return null;
  }
  const numericPart = externalId.slice(lastUnderscoreIndex + 1);
  return numericPart.length > 0 && !isNaN(Number(numericPart)) ? parseInt(numericPart, 10) : null;
}

function getModelIdQuery(revisionExternalId: string, space: string) {
  return {
    with: {
      revision: {
        nodes: {
          filter: {
            and: [getNodeExternalIdEqualsFilter(revisionExternalId), getNodeSpaceEqualsFilter(space)]
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
