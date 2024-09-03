/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk';
import { type DmsUniqueIdentifier, type FdmSDK, type NodeItem } from '../FdmSDK';
import { COGNITE_CAD_REVISION_SOURCE, type CogniteCADRevisionProperties } from './dataModels';
import { restrictToDmsId } from './restrictToDmsId';
import { revisionQuery } from './revisionQuery';

export async function getDMSRevision(
  model: DmsUniqueIdentifier,
  revisionId: number,
  fdmSdk: FdmSDK
): Promise<NodeItem<CogniteCADRevisionProperties>> {
  const query = {
    ...revisionQuery,
    parameters: { modelReference: restrictToDmsId(model), revisionId }
  } as const satisfies QueryRequest;

  const result = await fdmSdk.queryNodesAndEdges<
    typeof revisionQuery,
    [{ source: typeof COGNITE_CAD_REVISION_SOURCE; properties: CogniteCADRevisionProperties }]
  >(query);

  if (result.items.revision.length === 0) {
    throw new Error(
      `No revision found for ID ${revisionId} on model ${model.space}, ${model.externalId}`
    );
  }

  return result.items.revision[0];
}
