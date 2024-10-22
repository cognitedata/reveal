/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { DataModelsSdk } from '../DataModelsSdk';
import { COGNITE_3D_REVISION_SOURCE } from './constants';
import { getNodeExternalIdEqualsFilter, getNodeSpaceEqualsFilter } from './utils';

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
  const modelMatched = modelExternalId.match(/\d+$/);
  const revisionMatched = revisionExternalId.match(/\d+$/);
  if (!modelMatched || !revisionMatched) {
    throw new Error(`No numeric ID found in external ID ${modelExternalId}`);
  }

  return { modelId: parseInt(modelMatched[0], 10), revisionId: parseInt(revisionMatched[0], 10) };
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
